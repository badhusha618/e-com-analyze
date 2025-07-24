import express, { Request, Response } from "express";
import { eq, and, or, desc, sql, like } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  roles,
  userRoles,
  userAuditLog,
  userChangeRequests,
  pendingUserApprovals,
  createUserSchema,
  updateUserRolesSchema,
  PERMISSIONS,
  type User,
  type CreateUser,
} from "../shared/schema";
import { 
  UserManagementService, 
  authenticateToken, 
  requirePermission, 
  requireRole,
  rateLimitMiddleware 
} from "./userManagement";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const userService = new UserManagementService();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User & { 
        roles: any[], 
        permissions: string[] 
      };
    }
  }
}

// Authentication routes
router.post("/login", rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    
    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, username)))
      .limit(1);
      
    if (!user || !user.isActive || user.isSuspended) {
      return res.status(401).json({ error: "Invalid credentials or account suspended" });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Increment login attempts
      await db
        .update(users)
        .set({ 
          loginAttempts: sql`${users.loginAttempts} + 1`,
          lockedUntil: user.loginAttempts >= 4 ? 
            new Date(Date.now() + 30 * 60 * 1000) : // Lock for 30 minutes
            undefined
        })
        .where(eq(users.id, user.id));
        
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      return res.status(423).json({ 
        error: "Account temporarily locked due to failed login attempts",
        unlockAt: user.lockedUntil
      });
    }
    
    // Reset login attempts on successful login
    await db
      .update(users)
      .set({ 
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      })
      .where(eq(users.id, user.id));
    
    // Get user roles
    const userRolesData = await userService.getUserRoles(user.id);
    const permissions = userRolesData.flatMap(role => role.permissions as string[]);
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        roles: userRolesData.map(r => r.name),
        permissions
      },
      JWT_SECRET,
      { expiresIn: `${user.sessionTimeout}h` }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: userRolesData,
        permissions,
        lastLoginAt: user.lastLoginAt,
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User management routes
router.get("/admin/users", authenticateToken, requirePermission(PERMISSIONS.USER_READ), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
        isSuspended: users.isSuspended,
        isExternal: users.isExternal,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users);
    
    // Apply filters
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`)
        )
      );
    }
    
    if (status === "active") conditions.push(eq(users.isActive, true));
    if (status === "inactive") conditions.push(eq(users.isActive, false));
    if (status === "suspended") conditions.push(eq(users.isSuspended, true));
    if (status === "external") conditions.push(eq(users.isExternal, true));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const usersData = await query
      .limit(Number(limit))
      .offset(offset)
      .orderBy(desc(users.createdAt));
    
    // Get roles for each user
    const usersWithRoles = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        roles: await userService.getUserRoles(user.id),
      }))
    );
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    res.json({
      users: usersWithRoles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(count),
        pages: Math.ceil(Number(count) / Number(limit)),
      }
    });
    
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/admin/users", authenticateToken, requirePermission(PERMISSIONS.USER_CREATE), async (req: Request, res: Response) => {
  try {
    const userData = createUserSchema.parse(req.body);
    const { roleIds = [] } = req.body;
    
    const newUser = await userService.createUser(req.user!, userData, roleIds);
    
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      }
    });
    
  } catch (error) {
    console.error("Create user error:", error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
});

router.put("/admin/users/:id/roles", authenticateToken, requirePermission(PERMISSIONS.USER_ROLES_UPDATE), async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { roleIds, justification, emergencyRequest = false } = updateUserRolesSchema.parse(req.body);
    
    // Prevent self-role modification for non-super admins
    if (userId === req.user!.id && !req.user!.roles.some((r: any) => r.name === "SUPER_ADMIN")) {
      return res.status(403).json({ error: "Cannot modify your own roles" });
    }
    
    const result = await userService.updateUserRoles(
      req.user!,
      userId,
      roleIds,
      justification,
      emergencyRequest
    );
    
    if (result) {
      // Change request submitted
      res.status(202).json({
        message: "Change request submitted for approval",
        requestId: result.id,
        expiresAt: result.expiresAt,
      });
    } else {
      // Direct change applied
      res.json({ message: "User roles updated successfully" });
    }
    
  } catch (error) {
    console.error("Update user roles error:", error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to update user roles" });
    }
  }
});

router.delete("/admin/users/:id", authenticateToken, requireRole("SUPER_ADMIN"), async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    
    await userService.deleteUser(req.user!, userId);
    
    res.json({ message: "User deleted successfully" });
    
  } catch (error) {
    console.error("Delete user error:", error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
});

// Change request management
router.get("/admin/change-requests", authenticateToken, requireRole("SUPER_ADMIN"), async (req: Request, res: Response) => {
  try {
    const { status = "PENDING" } = req.query;
    
    const requests = await db
      .select({
        id: userChangeRequests.id,
        changeType: userChangeRequests.changeType,
        proposedChanges: userChangeRequests.proposedChanges,
        currentValues: userChangeRequests.currentValues,
        justification: userChangeRequests.justification,
        status: userChangeRequests.status,
        emergencyRequest: userChangeRequests.emergencyRequest,
        expiresAt: userChangeRequests.expiresAt,
        createdAt: userChangeRequests.createdAt,
        requester: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(userChangeRequests)
      .innerJoin(users, eq(userChangeRequests.requesterId, users.id))
      .where(eq(userChangeRequests.status, status as string))
      .orderBy(desc(userChangeRequests.createdAt));
    
    res.json({ requests });
    
  } catch (error) {
    console.error("Get change requests error:", error);
    res.status(500).json({ error: "Failed to fetch change requests" });
  }
});

router.post("/admin/change-requests/:id/approve", authenticateToken, requireRole("SUPER_ADMIN"), async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { reason } = req.body;
    
    await userService.processChangeRequest(req.user!, requestId, "approve", reason);
    
    res.json({ message: "Change request approved" });
    
  } catch (error) {
    console.error("Approve change request error:", error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to approve change request" });
    }
  }
});

router.post("/admin/change-requests/:id/reject", authenticateToken, requireRole("SUPER_ADMIN"), async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }
    
    await userService.processChangeRequest(req.user!, requestId, "reject", reason);
    
    res.json({ message: "Change request rejected" });
    
  } catch (error) {
    console.error("Reject change request error:", error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to reject change request" });
    }
  }
});

// Audit log
router.get("/admin/audit-log", authenticateToken, requirePermission(PERMISSIONS.ADMIN_AUDIT_READ), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, userId, action, days = 30 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    
    let query = db
      .select({
        id: userAuditLog.id,
        action: userAuditLog.action,
        entityType: userAuditLog.entityType,
        entityId: userAuditLog.entityId,
        beforeValues: userAuditLog.beforeValues,
        afterValues: userAuditLog.afterValues,
        changeSummary: userAuditLog.changeSummary,
        ipAddress: userAuditLog.ipAddress,
        riskScore: userAuditLog.riskScore,
        isAnomalous: userAuditLog.isAnomalous,
        timestamp: userAuditLog.timestamp,
        admin: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(userAuditLog)
      .innerJoin(users, eq(userAuditLog.adminId, users.id))
      .where(sql`${userAuditLog.timestamp} > ${since}`);
    
    const conditions = [];
    if (userId) conditions.push(eq(userAuditLog.targetUserId, Number(userId)));
    if (action) conditions.push(eq(userAuditLog.action, action as string));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const auditLogs = await query
      .limit(Number(limit))
      .offset(offset)
      .orderBy(desc(userAuditLog.timestamp));
    
    res.json({ auditLogs });
    
  } catch (error) {
    console.error("Get audit log error:", error);
    res.status(500).json({ error: "Failed to fetch audit log" });
  }
});

// Roles management
router.get("/admin/roles", authenticateToken, requirePermission(PERMISSIONS.ROLE_READ), async (req: Request, res: Response) => {
  try {
    const allRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.isActive, true))
      .orderBy(roles.name);
    
    res.json({ roles: allRoles });
    
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

// User profile
router.get("/profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRolesData = await userService.getUserRoles(req.user!.id);
    
    res.json({
      user: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
        firstName: req.user!.firstName,
        lastName: req.user!.lastName,
        lastLoginAt: req.user!.lastLoginAt,
        twoFactorEnabled: req.user!.twoFactorEnabled,
        roles: userRolesData,
        permissions: req.user!.permissions,
      }
    });
    
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Session management
router.get("/admin/sessions", authenticateToken, requirePermission(PERMISSIONS.ADMIN_AUDIT_READ), async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    // In a real implementation, you'd query active sessions from Redis or database
    // For now, return mock data structure
    res.json({
      sessions: [
        {
          id: "session_123",
          userId: userId || req.user!.id,
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0...",
          location: "New York, US",
          isActive: true,
          lastActivity: new Date(),
          createdAt: new Date(),
        }
      ]
    });
    
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Anomaly detection
router.get("/admin/anomalies", authenticateToken, requireRole("SUPER_ADMIN"), async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    
    const anomalies = await db
      .select({
        id: userAuditLog.id,
        action: userAuditLog.action,
        riskScore: userAuditLog.riskScore,
        changeSummary: userAuditLog.changeSummary,
        timestamp: userAuditLog.timestamp,
        admin: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(userAuditLog)
      .innerJoin(users, eq(userAuditLog.adminId, users.id))
      .where(
        and(
          eq(userAuditLog.isAnomalous, true),
          sql`${userAuditLog.timestamp} > ${since}`
        )
      )
      .orderBy(desc(userAuditLog.riskScore), desc(userAuditLog.timestamp));
    
    res.json({ anomalies });
    
  } catch (error) {
    console.error("Get anomalies error:", error);
    res.status(500).json({ error: "Failed to fetch anomalies" });
  }
});

export { router as userRoutes };