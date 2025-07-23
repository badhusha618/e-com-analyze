import { Router, type Response } from 'express';
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  validatePassword,
  checkLoginAttempts,
  updateLoginAttempts,
  isAccountLocked,
  type AuthRequest
} from './auth';
import { storage } from './storage';
import { 
  loginSchema, 
  registerSchema,
  type LoginData,
  type RegisterData,
  PERMISSIONS
} from '@shared/schema';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const authRouter = Router();

// Helper function to get user permissions based on roles
const getUserPermissions = async (userId: number): Promise<string[]> => {
  const userRoles = await storage.getUserRoles(userId);
  const permissions: string[] = [];
  
  for (const userRole of userRoles) {
    const role = await storage.getRole(userRole.roleId);
    if (role && role.isActive) {
      const rolePermissions = Array.isArray(role.permissions) 
        ? role.permissions as string[]
        : [];
      permissions.push(...rolePermissions);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(permissions)];
};

// POST /auth/register
authRouter.post('/register', async (req, res: Response) => {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.issues 
      });
    }

    const userData: RegisterData = validationResult.data;

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

    // Create user with default role
    const newUser = await storage.createUser({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'READER', // Default role
      isActive: true,
      isSuspended: false,
      isExternal: false,
      twoFactorEnabled: false,
      loginAttempts: 0,
      sessionTimeout: 8
    });

    // Assign default READER role
    const readerRole = await storage.getRoleByName('READER');
    if (readerRole) {
      await storage.assignUserRole({
        userId: newUser.id,
        roleId: readerRole.id,
        assignedBy: newUser.id, // Self-assigned for registration
        isActive: true
      });
    }

    // Create audit log entry
    await storage.createAuditLog({
      adminId: newUser.id,
      targetUserId: newUser.id,
      action: 'USER_REGISTRATION',
      entityType: 'USER',
      entityId: newUser.id,
      afterValues: { 
        username: newUser.username, 
        email: newUser.email,
        role: 'READER'
      },
      changeSummary: 'User self-registered',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: nanoid(),
      riskScore: '0.1',
      isAnomalous: false
    });

    // Get user permissions
    const permissions = await getUserPermissions(newUser.id);

    // Generate JWT token
    const token = generateToken(newUser, permissions);

    // Create session
    const sessionId = nanoid();
    await storage.createSession({
      id: sessionId,
      userId: newUser.id,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      deviceFingerprint: req.get('X-Device-Fingerprint') || 'unknown',
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Return success response
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        permissions
      },
      token,
      sessionId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// POST /auth/login
authRouter.post('/login', async (req, res: Response) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.issues 
      });
    }

    const loginData: LoginData = validationResult.data;

    // Find user by email or username
    const user = await storage.getUserByUsernameOrEmail(loginData.email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (isAccountLocked(user)) {
      const lockTime = user.lockedUntil ? new Date(user.lockedUntil).toLocaleString() : 'unknown';
      return res.status(423).json({ 
        message: `Account is locked until ${lockTime} due to too many failed login attempts`
      });
    }

    // Check login attempts
    const attemptCheck = await checkLoginAttempts(user.id);
    if (!attemptCheck.allowed) {
      return res.status(429).json({ 
        message: 'Too many login attempts. Account temporarily locked.',
        remainingAttempts: attemptCheck.remainingAttempts
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(loginData.password, user.password);
    if (!isPasswordValid) {
      await updateLoginAttempts(user.id, false);
      const updatedAttemptCheck = await checkLoginAttempts(user.id);
      return res.status(401).json({ 
        message: 'Invalid credentials',
        remainingAttempts: updatedAttemptCheck.remainingAttempts
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Account is suspended' });
    }

    // Successful login - reset login attempts
    await updateLoginAttempts(user.id, true);
    await storage.updateLastLogin(user.id);

    // Get user permissions
    const permissions = await getUserPermissions(user.id);

    // Generate JWT token
    const sessionId = nanoid();
    const token = generateToken(user, permissions, sessionId);

    // Create session
    await storage.createSession({
      id: sessionId,
      userId: user.id,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      location: req.get('X-Location') || null,
      deviceFingerprint: req.get('X-Device-Fingerprint') || 'unknown',
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Create audit log entry
    await storage.createAuditLog({
      adminId: user.id,
      targetUserId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      changeSummary: 'User logged in successfully',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: sessionId,
      riskScore: '0.1',
      isAnomalous: false
    });

    // Return success response
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions,
        lastLoginAt: user.lastLoginAt,
        twoFactorEnabled: user.twoFactorEnabled
      },
      token,
      sessionId
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// POST /auth/logout
authRouter.post('/logout', async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.get('X-Session-Id');
    
    if (sessionId) {
      await storage.deleteSession(sessionId);
    }

    // Create audit log entry
    if (req.user) {
      await storage.createAuditLog({
        adminId: req.user.id,
        targetUserId: req.user.id,
        action: 'USER_LOGOUT',
        entityType: 'USER',
        entityId: req.user.id,
        changeSummary: 'User logged out',
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        sessionId: sessionId || 'unknown',
        riskScore: '0.1',
        isAnomalous: false
      });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error during logout' });
  }
});

// GET /auth/me - Get current user profile
authRouter.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const permissions = await getUserPermissions(user.id);
    const sessions = await storage.getUserSessions(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions,
        isActive: user.isActive,
        isSuspended: user.isSuspended,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      },
      activeSessions: sessions.filter(s => s.isActive).length
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /auth/sessions - Get user sessions
authRouter.get('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const sessions = await storage.getUserSessions(req.user.id);
    
    res.json({
      sessions: sessions.map(session => ({
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        location: session.location,
        isActive: session.isActive,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt
      }))
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /auth/sessions/:sessionId - Revoke a session
authRouter.delete('/sessions/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { sessionId } = req.params;
    const session = await storage.getSession(sessionId);
    
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await storage.deleteSession(sessionId);

    // Create audit log entry
    await storage.createAuditLog({
      adminId: req.user.id,
      targetUserId: req.user.id,
      action: 'SESSION_REVOKED',
      entityType: 'SESSION',
      entityId: null,
      changeSummary: `Session ${sessionId} revoked`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      sessionId: req.get('X-Session-Id') || 'unknown',
      riskScore: '0.2',
      isAnomalous: false
    });

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { authRouter };