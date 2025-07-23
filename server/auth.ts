import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { type Request, type Response, type NextFunction } from 'express';
import { storage } from './storage';
import { type User, type UserWithRoles } from '@shared/schema';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export interface JWTPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

export const generateToken = (user: User, permissions: string[], sessionId?: string): string => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    permissions,
    sessionId: sessionId || nanoid()
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  try {
    const user = await storage.getUserById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'User not found or inactive' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Enhanced password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return { isValid: errors.length === 0, errors };
};

// Check if account is locked
export const isAccountLocked = (user: User): boolean => {
  if (!user.lockedUntil) return false;
  return new Date() < user.lockedUntil;
};

// Rate limiting for login attempts
export const checkLoginAttempts = async (userId: number): Promise<{ allowed: boolean; remainingAttempts: number }> => {
  const user = await storage.getUserById(userId);
  if (!user) return { allowed: false, remainingAttempts: 0 };
  
  if (isAccountLocked(user)) {
    return { allowed: false, remainingAttempts: 0 };
  }
  
  const remainingAttempts = MAX_LOGIN_ATTEMPTS - (user.loginAttempts || 0);
  return { allowed: remainingAttempts > 0, remainingAttempts };
};

// Update login attempts
export const updateLoginAttempts = async (userId: number, success: boolean): Promise<void> => {
  if (success) {
    await storage.resetLoginAttempts(userId);
  } else {
    const attempts = await storage.incrementLoginAttempts(userId);
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + ACCOUNT_LOCK_TIME);
      await storage.lockUserAccount(userId, lockUntil);
    }
  }
};

// Permission checking
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('admin:*');
};

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!hasPermission(req.user.permissions, permission)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permission,
        current: req.user.permissions 
      });
    }
    
    next();
  };
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};