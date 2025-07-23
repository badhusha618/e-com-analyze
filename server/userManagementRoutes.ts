import { Router, type Response } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { requireAuth, requirePermission, type AuthRequest } from './auth';
import { nanoid } from 'nanoid';
import { hashPassword } from './auth';

const userManagementRouter = Router();

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roles: z.array(z.string()).optional().default(['READER']),
  isExternal: z.boolean().optional().default(false),
  sessionTimeout: z.number().min(1).max(24).optional().default(8),
});

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  isExternal: z.boolean().optional(),
  sessionTimeout: z.number().min(1).max(24).optional(),
});

const assignRolesSchema = z.object({
  roleIds: z.array(z.number()),
});

const bulkActionSchema = z.object({
  userIds: z.array(z.number()),
  action: z.enum(['activate', 'suspend', 'delete', 'assign_role']),
  roleId: z.number().optional(),
});

// GET /admin/users - List users with pagination and filtering
userManagementRouter.get('/users', requireAuth, requirePermission('admin:users'), async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const role = req.query.role as string || '';
    const status = req.query.status as string || '';
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    const offset = (page - 1) * limit;

    const users = await storage.getUsers({
      limit,
      offset,
      search,
      role,
      status,
      sortBy,
      sortOrder
    });

    const totalUsers = await storage.getUsersCount({ search, role, status });
    const totalPages = Math.ceil(totalUsers / limit);

    // Add user roles and sessions info
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const userRoles = await storage.getUserRoles(user.id);
      const activeSessions = await storage.getActiveUserSessions(user.id);
      const permissions = await storage.getUserPermissions(user.id);
      
      return {
        ...user,
        roles: userRoles,
        activeSessionsCount: activeSessions.length,
        permissions: Array.from(new Set(permissions)),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
      };
    }));

    res.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// POST /admin/users - Create new user
userManagementRouter.post('/users', requireAuth, requirePermission('admin:users'), async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.issues
      });
    }

    const userData = validationResult.data;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already taken' });
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
      role: userData.roles[0] || 'READER',
      isActive: true,
      isSuspended: false,
      isExternal: userData.isExternal,
      twoFactorEnabled: false,
      loginAttempts: 0,
      sessionTimeout: userData.sessionTimeout
    });

    // Assign roles
    for (const roleName of userData.roles) {
      const role = await storage.getRoleByName(roleName);
      if (role) {
        await storage.assignUserRole({
          userId: newUser.id,
          roleId: role.id,
          assignedBy: req.user!.id,
          isActive: true
        });
      }
    }

    // Create audit log
    await storage.createAuditLog({
      adminId: req.user!.id,
      targetUserId: newUser.id,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: newUser.id,
      afterValues: {
        username: newUser.username,
        email: newUser.email,
        roles: userData.roles
      },
      changeSummary: `User created by admin`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: req.sessionId || nanoid(),
      riskScore: '0.2',
      isAnomalous: false
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isActive: newUser.isActive,
        roles: userData.roles
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// PUT /admin/users/:id - Update user
userManagementRouter.put('/users/:id', requireAuth, requirePermission('admin:users'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const validationResult = updateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.issues
      });
    }

    const updateData = validationResult.data;

    // Get current user data for audit
    const currentUser = await storage.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-suspension for safety
    if (req.user!.id === userId && updateData.isSuspended === true) {
      return res.status(400).json({ message: 'Cannot suspend your own account' });
    }

    // Update user
    const updatedUser = await storage.updateUser(userId, updateData);

    // Create audit log
    await storage.createAuditLog({
      adminId: req.user!.id,
      targetUserId: userId,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: userId,
      beforeValues: {
        username: currentUser.username,
        email: currentUser.email,
        isActive: currentUser.isActive,
        isSuspended: currentUser.isSuspended
      },
      afterValues: updateData,
      changeSummary: `User updated by admin: ${Object.keys(updateData).join(', ')}`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: req.sessionId || nanoid(),
      riskScore: updateData.isSuspended ? '0.8' : '0.3',
      isAnomalous: false
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// DELETE /admin/users/:id - Delete user
userManagementRouter.delete('/users/:id', requireAuth, requirePermission('admin:users'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const hardDelete = req.query.hard === 'true';

    // Prevent self-deletion
    if (req.user!.id === userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (hardDelete) {
      // Hard delete - remove from database
      await storage.deleteUser(userId);
    } else {
      // Soft delete - deactivate user
      await storage.updateUser(userId, { isActive: false, isSuspended: true });
    }

    // Create audit log
    await storage.createAuditLog({
      adminId: req.user!.id,
      targetUserId: userId,
      action: hardDelete ? 'USER_DELETED' : 'USER_DEACTIVATED',
      entityType: 'USER',
      entityId: userId,
      beforeValues: {
        username: user.username,
        email: user.email,
        isActive: user.isActive
      },
      changeSummary: `User ${hardDelete ? 'deleted' : 'deactivated'} by admin`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: req.sessionId || nanoid(),
      riskScore: '0.9',
      isAnomalous: false
    });

    res.json({
      message: `User ${hardDelete ? 'deleted' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// PUT /admin/users/:id/roles - Assign roles (SUPER_ADMIN only)
userManagementRouter.put('/users/:id/roles', requireAuth, requirePermission('admin:roles'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const validationResult = assignRolesSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.issues
      });
    }

    const { roleIds } = validationResult.data;

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get current roles for audit
    const currentRoles = await storage.getUserRoles(userId);

    // Remove all current roles
    await storage.removeAllUserRoles(userId);

    // Assign new roles
    for (const roleId of roleIds) {
      await storage.assignUserRole({
        userId,
        roleId,
        assignedBy: req.user!.id,
        isActive: true
      });
    }

    // Get new roles for response
    const newRoles = await storage.getUserRoles(userId);

    // Create audit log
    await storage.createAuditLog({
      adminId: req.user!.id,
      targetUserId: userId,
      action: 'ROLES_UPDATED',
      entityType: 'USER',
      entityId: userId,
      beforeValues: { roles: currentRoles.map(r => r.role?.name) },
      afterValues: { roles: newRoles.map(r => r.role?.name) },
      changeSummary: `User roles updated by admin`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: req.sessionId || nanoid(),
      riskScore: '0.7',
      isAnomalous: false
    });

    res.json({
      message: 'Roles updated successfully',
      roles: newRoles
    });

  } catch (error) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ message: 'Failed to update user roles' });
  }
});

// GET /admin/permissions - List all permissions
userManagementRouter.get('/permissions', requireAuth, requirePermission('admin:permissions'), async (req: AuthRequest, res: Response) => {
  try {
    const permissions = await storage.getAllPermissions();
    
    // Group permissions by resource
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const [resource, action] = permission.split(':');
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(action);
      return acc;
    }, {} as Record<string, string[]>);

    res.json({
      permissions: groupedPermissions,
      allPermissions: permissions
    });

  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
});

// POST /admin/users/bulk - Bulk operations
userManagementRouter.post('/users/bulk', requireAuth, requirePermission('admin:users'), async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = bulkActionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.issues
      });
    }

    const { userIds, action, roleId } = validationResult.data;

    // Prevent self-actions
    if (userIds.includes(req.user!.id)) {
      return res.status(400).json({ message: 'Cannot perform bulk actions on your own account' });
    }

    let results = [];

    for (const userId of userIds) {
      try {
        const user = await storage.getUserById(userId);
        if (!user) continue;

        switch (action) {
          case 'activate':
            await storage.updateUser(userId, { isActive: true, isSuspended: false });
            results.push({ userId, status: 'activated' });
            break;
          case 'suspend':
            await storage.updateUser(userId, { isSuspended: true });
            results.push({ userId, status: 'suspended' });
            break;
          case 'delete':
            await storage.updateUser(userId, { isActive: false, isSuspended: true });
            results.push({ userId, status: 'deactivated' });
            break;
          case 'assign_role':
            if (roleId) {
              await storage.removeAllUserRoles(userId);
              await storage.assignUserRole({
                userId,
                roleId,
                assignedBy: req.user!.id,
                isActive: true
              });
              results.push({ userId, status: 'role_assigned' });
            }
            break;
        }

        // Create audit log for each user
        await storage.createAuditLog({
          adminId: req.user!.id,
          targetUserId: userId,
          action: `BULK_${action.toUpperCase()}`,
          entityType: 'USER',
          entityId: userId,
          changeSummary: `Bulk ${action} operation performed by admin`,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionId || nanoid(),
          riskScore: '0.5',
          isAnomalous: false
        });

      } catch (error) {
        results.push({ userId, status: 'error', error: error.message });
      }
    }

    res.json({
      message: 'Bulk operation completed',
      results
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    res.status(500).json({ message: 'Failed to perform bulk operation' });
  }
});

// GET /admin/users/:id/sessions - Get user sessions
userManagementRouter.get('/users/:id/sessions', requireAuth, requirePermission('admin:users'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const sessions = await storage.getUserSessions(userId);
    
    res.json({
      sessions: sessions.map(session => ({
        ...session,
        isCurrentSession: session.id === req.sessionId,
        lastActiveAt: session.lastActivityAt ? new Date(session.lastActivityAt).toISOString() : null,
      }))
    });

  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ message: 'Failed to fetch user sessions' });
  }
});

// DELETE /admin/users/:id/sessions/:sessionId - Revoke user session
userManagementRouter.delete('/users/:id/sessions/:sessionId', requireAuth, requirePermission('admin:users'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const sessionId = req.params.sessionId;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Cannot revoke current session through this endpoint
    if (sessionId === req.sessionId) {
      return res.status(400).json({ message: 'Cannot revoke current session' });
    }

    await storage.revokeSession(sessionId);

    // Create audit log
    await storage.createAuditLog({
      adminId: req.user!.id,
      targetUserId: userId,
      action: 'SESSION_REVOKED',
      entityType: 'SESSION',
      entityId: sessionId,
      changeSummary: `Session revoked by admin`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: req.sessionId || nanoid(),
      riskScore: '0.4',
      isAnomalous: false
    });

    res.json({ message: 'Session revoked successfully' });

  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ message: 'Failed to revoke session' });
  }
});

// GET /admin/audit-logs - Get audit logs
userManagementRouter.get('/audit-logs', requireAuth, requirePermission('admin:audit'), async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const action = req.query.action as string || '';
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const startDate = req.query.startDate as string || '';
    const endDate = req.query.endDate as string || '';

    const offset = (page - 1) * limit;

    const auditLogs = await storage.getAuditLogs({
      limit,
      offset,
      action,
      userId,
      startDate,
      endDate
    });

    const totalLogs = await storage.getAuditLogsCount({
      action,
      userId,
      startDate,
      endDate
    });

    const totalPages = Math.ceil(totalLogs / limit);

    res.json({
      auditLogs,
      pagination: {
        page,
        limit,
        totalPages,
        totalLogs,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

export default userManagementRouter;