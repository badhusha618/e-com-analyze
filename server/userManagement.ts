import { eq, and, or, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  roles, 
  userRoles, 
  userAuditLog, 
  jitProvisioningRules,
  pendingUserApprovals,
  userChangeRequests,
  userSessions,
  anomalyDetectionModels,
  PERMISSIONS,
  type User,
  type Role,
  type UserRole,
  type CreateUser,
  type NewUserRole,
  type NewUserAuditLog,
  type NewJitProvisioningRule,
  type NewPendingUserApproval,
  type NewUserChangeRequest,
  type Permission
} from "../shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// User management service
export class UserManagementService {
  
  // Create user with role-based access control
  async createUser(adminUser: User, userData: CreateUser, requestedRoles: number[] = []): Promise<User> {
    await this.requirePermission(adminUser, PERMISSIONS.USER_CREATE);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, userData.email), eq(users.username, userData.username)))
      .limit(1);
      
    if (existingUser.length > 0) {
      throw new Error("User with this email or username already exists");
    }
    
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      
    // Assign roles if provided and user has permission
    if (requestedRoles.length > 0) {
      await this.assignUserRoles(adminUser, newUser.id, requestedRoles, "Initial role assignment");
    }
    
    // Log audit trail
    await this.logUserAction(adminUser.id, {
      action: "CREATE_USER",
      entityType: "USER", 
      entityId: newUser.id,
      afterValues: { userId: newUser.id, email: newUser.email },
      changeSummary: `Created user ${newUser.email}`,
    });
    
    return newUser;
  }
  
  // Update user roles with approval workflow
  async updateUserRoles(
    adminUser: User, 
    targetUserId: number, 
    roleIds: number[], 
    justification: string,
    emergencyRequest: boolean = false
  ): Promise<NewUserChangeRequest | void> {
    const hasDirectAccess = await this.hasPermission(adminUser, PERMISSIONS.USER_ROLES_UPDATE);
    const isSuperAdmin = await this.hasRole(adminUser, "SUPER_ADMIN");
    
    // Super admins can make direct changes
    if (isSuperAdmin && (emergencyRequest || hasDirectAccess)) {
      return await this.executeRoleUpdate(adminUser, targetUserId, roleIds, justification);
    }
    
    // Others must submit change request
    const [changeRequest] = await db
      .insert(userChangeRequests)
      .values({
        requesterId: adminUser.id,
        targetUserId,
        changeType: "UPDATE_ROLES",
        proposedChanges: { roleIds } as any,
        justification,
        emergencyRequest,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
      })
      .returning();
      
    // Calculate anomaly score
    const riskScore = await this.calculateAnomalyScore(adminUser, "UPDATE_ROLES", { targetUserId, roleIds });
    
    // Auto-flag high-risk changes
    if (riskScore > 0.7) {
      await this.flagAnomalousActivity(changeRequest.id, riskScore);
    }
    
    return changeRequest;
  }
  
  // Execute role update (direct or approved)
  private async executeRoleUpdate(
    adminUser: User, 
    targetUserId: number, 
    roleIds: number[], 
    justification: string
  ): Promise<void> {
    // Get current roles
    const currentRoles = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, targetUserId), eq(userRoles.isActive, true)));
      
    // Deactivate existing roles
    await db
      .update(userRoles)
      .set({ isActive: false })
      .where(eq(userRoles.userId, targetUserId));
      
    // Assign new roles
    if (roleIds.length > 0) {
      await db.insert(userRoles).values(
        roleIds.map(roleId => ({
          userId: targetUserId,
          roleId,
          assignedBy: adminUser.id,
          assignedAt: new Date(),
        }))
      );
    }
    
    // Log audit trail
    await this.logUserAction(adminUser.id, {
      action: "UPDATE_ROLES",
      entityType: "USER",
      entityId: targetUserId,
      beforeValues: { roleIds: currentRoles.map(r => r.roleId) },
      afterValues: { roleIds },
      changeSummary: `Updated roles for user ${targetUserId}: ${justification}`,
    });
  }
  
  // Approve/reject change requests
  async processChangeRequest(
    adminUser: User, 
    requestId: number, 
    action: "approve" | "reject", 
    reason?: string
  ): Promise<void> {
    await this.requirePermission(adminUser, PERMISSIONS.ADMIN_EMERGENCY_ACCESS);
    
    const [request] = await db
      .select()
      .from(userChangeRequests)
      .where(eq(userChangeRequests.id, requestId))
      .limit(1);
      
    if (!request || request.status !== "PENDING") {
      throw new Error("Change request not found or not pending");
    }
    
    if (action === "approve") {
      await this.executeRoleUpdate(
        adminUser,
        request.targetUserId!,
        (request.proposedChanges as any).roleIds,
        request.justification || "Approved change request"
      );
      
      await db
        .update(userChangeRequests)
        .set({
          status: "APPROVED",
          approverId: adminUser.id,
          approvedAt: new Date(),
          approvalReason: reason,
        })
        .where(eq(userChangeRequests.id, requestId));
    } else {
      await db
        .update(userChangeRequests)
        .set({
          status: "REJECTED",
          approverId: adminUser.id,
          approvedAt: new Date(),
          rejectionReason: reason,
        })
        .where(eq(userChangeRequests.id, requestId));
    }
  }
  
  // Delete user (SUPER_ADMIN only)
  async deleteUser(adminUser: User, targetUserId: number): Promise<void> {
    await this.requireRole(adminUser, "SUPER_ADMIN");
    
    // Prevent self-deletion
    if (adminUser.id === targetUserId) {
      throw new Error("Cannot delete your own account");
    }
    
    // Check if target is SUPER_ADMIN (require 2+ admins)
    const targetUserRoles = await this.getUserRoles(targetUserId);
    const isSuperAdmin = targetUserRoles.some(role => role.name === "SUPER_ADMIN");
    
    if (isSuperAdmin) {
      const superAdminCount = await this.countUsersWithRole("SUPER_ADMIN");
      if (superAdminCount <= 2) {
        throw new Error("Cannot delete SUPER_ADMIN when less than 2 remain");
      }
    }
    
    // Soft delete user
    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, targetUserId));
      
    // Deactivate all roles
    await db
      .update(userRoles)
      .set({ isActive: false })
      .where(eq(userRoles.userId, targetUserId));
      
    // Log audit trail
    await this.logUserAction(adminUser.id, {
      action: "DELETE_USER",
      entityType: "USER",
      entityId: targetUserId,
      changeSummary: `Deleted user ${targetUserId}`,
    });
  }
  
  // JIT Provisioning for OAuth/external users
  async provisionJitUser(claims: any, providerName: string): Promise<User | NewPendingUserApproval> {
    const email = claims.email;
    const domain = email.split('@')[1];
    
    // Check for existing JIT rule
    const [rule] = await db
      .select()
      .from(jitProvisioningRules)
      .where(
        and(
          eq(jitProvisioningRules.providerName, providerName),
          or(
            eq(jitProvisioningRules.emailDomain, domain),
            eq(jitProvisioningRules.emailDomain, "*") // Wildcard rule
          ),
          eq(jitProvisioningRules.isActive, true)
        )
      )
      .limit(1);
      
    if (!rule) {
      throw new Error("JIT provisioning not configured for this provider/domain");
    }
    
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
      
    if (existingUser) {
      return existingUser;
    }
    
    // Map claims to roles
    const mappedRoles = this.mapClaimsToRoles(claims, rule.claimMapping);
    
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username: claims.preferred_username || email,
        email,
        firstName: claims.given_name,
        lastName: claims.family_name,
        password: await bcrypt.hash(Math.random().toString(36), 12), // Random password for external users
        isExternal: true,
        isActive: !rule.requiresApproval,
      })
      .returning();
      
    if (rule.requiresApproval) {
      // Create pending approval
      const [pendingApproval] = await db
        .insert(pendingUserApprovals)
        .values({
          userId: newUser.id,
          providerClaims: claims,
          requestedRoles: mappedRoles,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
        .returning();
        
      return pendingApproval;
    } else {
      // Auto-assign roles
      if (mappedRoles.length > 0) {
        await db.insert(userRoles).values(
          mappedRoles.map(roleId => ({
            userId: newUser.id,
            roleId,
            assignedAt: new Date(),
          }))
        );
      }
      
      return newUser;
    }
  }
  
  // AI Anomaly Detection
  async calculateAnomalyScore(user: User, action: string, context: any): Promise<number> {
    const features = await this.extractFeatures(user, action, context);
    
    // Simple isolation forest-like scoring
    // In production, this would use a trained ML model
    let score = 0.0;
    
    // Time-based anomalies
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) score += 0.3; // After hours
    
    // Location-based anomalies (simplified)
    const recentLogins = await this.getRecentUserActivity(user.id, 24);
    if (recentLogins.length > 0) {
      // Check for geographic velocity (simplified)
      score += 0.2;
    }
    
    // Role escalation patterns
    if (action === "UPDATE_ROLES" && context.roleIds) {
      const currentRoles = await this.getUserRoles(user.id);
      const isEscalation = context.roleIds.some((roleId: number) => 
        !currentRoles.some(r => r.id === roleId)
      );
      if (isEscalation) score += 0.4;
    }
    
    // Bulk operations
    if (context.bulk || (context.roleIds && context.roleIds.length > 3)) {
      score += 0.3;
    }
    
    return Math.min(score, 1.0);
  }
  
  // Helper methods
  private async requirePermission(user: User, permission: Permission): Promise<void> {
    const hasPermission = await this.hasPermission(user, permission);
    if (!hasPermission) {
      throw new Error(`Insufficient permissions: ${permission}`);
    }
  }
  
  private async requireRole(user: User, roleName: string): Promise<void> {
    const hasRole = await this.hasRole(user, roleName);
    if (!hasRole) {
      throw new Error(`Requires role: ${roleName}`);
    }
  }
  
  async hasPermission(user: User, permission: Permission): Promise<boolean> {
    const userRolesData = await db
      .select({ permissions: roles.permissions })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, user.id),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        )
      );
      
    return userRolesData.some(role => 
      (role.permissions as string[]).includes(permission)
    );
  }
  
  async hasRole(user: User, roleName: string): Promise<boolean> {
    const userRole = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, user.id),
          eq(roles.name, roleName),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        )
      )
      .limit(1);
      
    return userRole.length > 0;
  }
  
  async getUserRoles(userId: number): Promise<Role[]> {
    return await db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        permissions: roles.permissions,
        isActive: roles.isActive,
        createdAt: roles.createdAt,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        )
      );
  }
  
  private async countUsersWithRole(roleName: string): Promise<number> {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(roles.name, roleName),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        )
      );
      
    return Number(result.count);
  }
  
  private async logUserAction(adminId: number, auditData: Partial<NewUserAuditLog>): Promise<void> {
    await db.insert(userAuditLog).values({
      adminId,
      ...auditData,
    });
  }
  
  private mapClaimsToRoles(claims: any, mapping: any): number[] {
    // Simplified claim mapping - in production this would be more sophisticated
    const roleIds: number[] = [];
    
    if (claims.groups && Array.isArray(claims.groups)) {
      for (const group of claims.groups) {
        if (mapping[group]) {
          roleIds.push(mapping[group]);
        }
      }
    }
    
    return roleIds;
  }
  
  private async extractFeatures(user: User, action: string, context: any): Promise<any> {
    return {
      userId: user.id,
      action,
      timestamp: new Date(),
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      ...context,
    };
  }
  
  private async getRecentUserActivity(userId: number, hours: number): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(userAuditLog)
      .where(
        and(
          eq(userAuditLog.targetUserId, userId),
          sql`${userAuditLog.timestamp} > ${since}`
        )
      )
      .orderBy(desc(userAuditLog.timestamp));
  }
  
  private async flagAnomalousActivity(requestId: number, riskScore: number): Promise<void> {
    // Update the change request with anomaly flag
    await db
      .update(userChangeRequests)
      .set({
        // Add risk score to metadata if needed
        proposedChanges: sql`${userChangeRequests.proposedChanges} || '{"riskScore": ${riskScore}}'`,
      })
      .where(eq(userChangeRequests.id, requestId));
      
    // Send alert to security team
    // Implementation would depend on your alerting system
    console.log(`🚨 Anomalous activity detected: Request ${requestId}, Risk Score: ${riskScore}`);
  }
  
  async assignUserRoles(adminUser: User, userId: number, roleIds: number[], justification: string): Promise<void> {
    await this.requirePermission(adminUser, PERMISSIONS.USER_ROLES_UPDATE);
    
    if (roleIds.length > 0) {
      await db.insert(userRoles).values(
        roleIds.map(roleId => ({
          userId,
          roleId,
          assignedBy: adminUser.id,
          assignedAt: new Date(),
        }))
      );
    }
    
    await this.logUserAction(adminUser.id, {
      action: "ASSIGN_ROLES",
      entityType: "USER",
      entityId: userId,
      afterValues: { roleIds },
      changeSummary: justification,
    });
  }
}

// Rate limiting middleware
export const rateLimitMiddleware = (req: any, res: any, next: Function) => {
  // Simple in-memory rate limiting - in production use Redis
  const ip = req.ip;
  const now = Date.now();
  
  // This would be stored in Redis in production
  const attempts = (global as any).loginAttempts || {};
  
  if (!attempts[ip!]) {
    attempts[ip!] = { count: 0, firstAttempt: now };
  }
  
  const timeWindow = now - attempts[ip!].firstAttempt;
  
  if (timeWindow > RATE_LIMIT_WINDOW) {
    // Reset window
    attempts[ip!] = { count: 1, firstAttempt: now };
  } else {
    attempts[ip!].count++;
  }
  
  if (attempts[ip!].count > RATE_LIMIT_ATTEMPTS) {
    return res.status(429).json({
      error: "Too many login attempts. Please try again later.",
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - timeWindow) / 1000),
    });
  }
  
  (global as any).loginAttempts = attempts;
  next();
};

// Authentication middleware
export const authenticateToken = async (req: any, res: any, next: Function) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user with roles
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
      
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or inactive user" });
    }
    
    // Get user roles
    const userRolesData = await db
      .select({
        id: roles.id,
        name: roles.name,
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, user.id),
          eq(userRoles.isActive, true),
          eq(roles.isActive, true)
        )
      );
    
    req.user = {
      ...user,
      roles: userRolesData,
      permissions: userRolesData.flatMap(role => role.permissions as string[]),
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Permission check middleware
export const requirePermission = (permission: Permission) => {
  return (req: any, res: any, next: Function) => {
    if (!req.user || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: "Insufficient permissions",
        required: permission 
      });
    }
    next();
  };
};

// Role check middleware  
export const requireRole = (roleName: string) => {
  return (req: any, res: any, next: Function) => {
    if (!req.user || !req.user.roles.some((role: any) => role.name === roleName)) {
      return res.status(403).json({ 
        error: "Insufficient role", 
        required: roleName 
      });
    }
    next();
  };
};