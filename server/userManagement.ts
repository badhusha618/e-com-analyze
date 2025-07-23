import { Router, type Response } from 'express';
import { 
  requirePermission,
  hasPermission,
  type AuthRequest
} from './auth';
import { storage } from './storage';
import { 
  createUserSchema,
  updateUserRolesSchema,
  PERMISSIONS,
  type CreateUser
} from '@shared/schema';
import { hashPassword, validatePassword } from './auth';
import { nanoid } from 'nanoid';

const userManagementRouter = Router();

// GET /admin/users - List all users (requires USER_READ permission)
userManagementRouter.get('/users', requirePermission(PERMISSIONS.USER_READ), async (req: AuthRequest, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await storage.getUserRoles(user.id);
        const roles = await Promise.all(
          userRoles.map(async (ur) => {
            const role = await storage.getRole(ur.roleId);
            return role ? {
              ...role,
              assignedAt: ur.assignedAt,
              expiresAt: ur.expiresAt
            } : null;
          })
        );
        
        return {
          ...user,
          password: undefined, // Don't send password
          roles: roles.filter(Boolean)
        };
      })
    );

    res.json({ users: usersWithRoles });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /admin/users/:id - Get specific user (requires USER_READ permission)
userManagementRouter.get('/users/:id', requirePermission(PERMISSIONS.USER_READ), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRoles = await storage.getUserRoles(userId);
    const roles = await Promise.all(
      userRoles.map(async (ur) => {
        const role = await storage.getRole(ur.roleId);
        return role ? {
          ...role,
          assignedAt: ur.assignedAt,
          expiresAt: ur.expiresAt
        } : null;
      })
    );

    const auditLogs = await storage.getAuditLogs(userId, 10);
    const sessions = await storage.getUserSessions(userId);

    res.json({
      user: {
        ...user,
        password: undefined, // Don't send password
        roles: roles.filter(Boolean)
      },
      recentActivity: auditLogs,
      activeSessions: sessions.filter(s => s.isActive)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /admin/users - Create new user (requires USER_CREATE permission)
userManagementRouter.post('/users', requirePermission(PERMISSIONS.USER_CREATE), async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.issues 
      });
    }

    const userData: CreateUser = validationResult.data;

    // Check if user already exists
    const existingUserByEmail = await storage.getUserByEmail(userData.email);
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const existingUserByUsername = await storage.getUserByUsername(userData.username);
    if (existingUserByUsername) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const newUser = await storage.createUser({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'READER',
      isActive: userData.isActive ?? true,
      isSuspended: userData.isSuspended ?? false,
      isExternal: userData.isExternal ?? false,
      twoFactorEnabled: userData.twoFactorEnabled ?? false,
      loginAttempts: 0,
      sessionTimeout: userData.sessionTimeout || 8
    });

    // Assign default role if not specified
    const defaultRole = await storage.getRoleByName(userData.role || 'READER');
    if (defaultRole) {
      await storage.assignUserRole({
        userId: newUser.id,
        roleId: defaultRole.id,
        assignedBy: req.user!.id,
        isActive: true
      });
    }

    // Create audit log entry
    await storage.createAuditLog({
      adminId: req.user!.id,
      targetUserId: newUser.id,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: newUser.id,
      afterValues: { 
        username: newUser.username, 
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive
      },
      changeSummary: `User created by admin ${req.user!.username}`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: req.get('X-Session-Id') || nanoid(),
      riskScore: '0.3',
      isAnomalous: false
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        ...newUser,
        password: undefined // Don't send password
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error during user creation' });
  }
});

// PUT /admin/users/:id/roles - Update user roles (requires USER_ROLES_UPDATE permission)
userManagementRouter.put('/users/:id/roles', requirePermission(PERMISSIONS.USER_ROLES_UPDATE), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Validate request body
    const validationResult = updateUserRolesSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.issues 
      });
    }

    const { roleIds, justification, emergencyRequest } = validationResult.data;

    // Check if target user exists
    const targetUser = await storage.getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-deletion protection
    if (userId === req.user!.id && roleIds.length === 0) {
      return res.status(403).json({ message: 'Cannot remove all roles from your own account' });
    }

    // Check if trying to assign SUPER_ADMIN role
    const superAdminRole = await storage.getRoleByName('SUPER_ADMIN');
    const isSuperAdminAssignment = superAdminRole && roleIds.includes(superAdminRole.id);
    
    if (isSuperAdminAssignment && !hasPermission(req.user!.permissions, 'admin:*')) {
      return res.status(403).json({ message: 'Only SUPER_ADMIN can assign SUPER_ADMIN role' });
    }

    // Get current roles for audit log
    const currentRoles = await storage.getUserRoles(userId);
    const currentRoleIds = currentRoles.map(ur => ur.roleId);

    // Update user roles
    const updatedRoles = await storage.updateUserRoles(userId, roleIds, req.user!.id);

    // Create audit log entry
    await storage.createAuditLog({
      adminId: req.user!.id,
      targetUserId: userId,
      action: 'USER_ROLES_UPDATED',
      entityType: 'USER',
      entityId: userId,
      beforeValues: { roleIds: currentRoleIds },
      afterValues: { roleIds: roleIds },
      changeSummary: `User roles updated by ${req.user!.username}. Justification: ${justification}`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: req.get('X-Session-Id') || nanoid(),
      riskScore: emergencyRequest ? '0.8' : '0.5',
      isAnomalous: emergencyRequest
    });

    res.json({
      message: 'User roles updated successfully',
      roles: updatedRoles
    });

  } catch (error) {
    console.error('Update user roles error:', error);
    res.status(500).json({ message: 'Internal server error during role update' });
  }
});

// DELETE /admin/users/:id - Delete user (requires USER_DELETE permission)
userManagementRouter.delete('/users/:id', requirePermission(PERMISSIONS.USER_DELETE), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Prevent self-deletion
    if (userId === req.user!.id) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    // Check if user exists
    const targetUser = await storage.getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is SUPER_ADMIN
    const userRoles = await storage.getUserRoles(userId);
    const superAdminRole = await storage.getRoleByName('SUPER_ADMIN');
    const isSuperAdmin = superAdminRole && userRoles.some(ur => ur.roleId === superAdminRole.id);

    if (isSuperAdmin) {
      // Ensure there are at least 2 SUPER_ADMINs before allowing deletion
      const allUsers = await storage.getAllUsers();
      let superAdminCount = 0;
      
      for (const user of allUsers) {
        const roles = await storage.getUserRoles(user.id);
        if (superAdminRole && roles.some(ur => ur.roleId === superAdminRole.id)) {
          superAdminCount++;
        }
      }

      if (superAdminCount <= 1) {
        return res.status(403).json({ 
          message: 'Cannot delete the last SUPER_ADMIN user. At least one SUPER_ADMIN must remain.' 
        });
      }
    }

    // Store user data for audit log before deletion
    const userData = {
      username: targetUser.username,
      email: targetUser.email,
      role: targetUser.role
    };

    // Delete user
    const deleted = await storage.deleteUser(userId);
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }

    // Create audit log entry
    await storage.createAuditLog({
      adminId: req.user!.id,
      targetUserId: userId,
      action: 'USER_DELETED',
      entityType: 'USER',
      entityId: userId,
      beforeValues: userData,
      changeSummary: `User ${userData.username} deleted by ${req.user!.username}`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: req.get('X-Session-Id') || nanoid(),
      riskScore: '0.9',
      isAnomalous: true
    });

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error during user deletion' });
  }
});

// GET /admin/roles - Get all roles (requires ROLE_READ permission)
userManagementRouter.get('/roles', requirePermission(PERMISSIONS.ROLE_READ), async (req: AuthRequest, res: Response) => {
  try {
    const roles = await storage.getRoles();
    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /admin/audit-logs - Get audit logs (requires ADMIN_AUDIT_READ permission)
userManagementRouter.get('/audit-logs', requirePermission(PERMISSIONS.ADMIN_AUDIT_READ), async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    const auditLogs = await storage.getAuditLogs(userId, limit);
    
    // Enrich with user details
    const enrichedLogs = await Promise.all(
      auditLogs.map(async (log) => {
        const admin = await storage.getUserById(log.adminId);
        const targetUser = log.targetUserId ? await storage.getUserById(log.targetUserId) : null;
        
        return {
          ...log,
          adminName: admin ? `${admin.firstName} ${admin.lastName} (${admin.username})` : 'Unknown',
          targetUserName: targetUser ? `${targetUser.firstName} ${targetUser.lastName} (${targetUser.username})` : null
        };
      })
    );

    res.json({ auditLogs: enrichedLogs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { userManagementRouter };