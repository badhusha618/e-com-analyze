import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  roles,
  userRoles,
  userAuditLog,
  userSessions,
  products, 
  categories, 
  vendors, 
  orders, 
  orderItems, 
  customers, 
  reviews, 
  marketingCampaigns, 
  alerts, 
  salesMetrics,
  type User, 
  type InsertUser,
  type Role,
  type NewRole,
  type UserRole,
  type NewUserRole,
  type UserAuditLog,
  type NewUserAuditLog,
  type UserSession,
  type NewUserSession,
  type UserWithRoles,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Vendor,
  type InsertVendor,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Customer,
  type InsertCustomer,
  type Review,
  type InsertReview,
  type MarketingCampaign,
  type InsertMarketingCampaign,
  type Alert,
  type InsertAlert,
  type SalesMetric,
  type InsertSalesMetric
} from "@shared/schema";
import { type IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.getUserById(id);
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByUsernameOrEmail(identifier: string): Promise<User | undefined> {
    const result = await db.select().from(users)
      .where(sql`${users.username} = ${identifier} OR ${users.email} = ${identifier}`)
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserWithRoles(id: number): Promise<UserWithRoles | undefined> {
    const user = await this.getUserById(id);
    if (!user) return undefined;

    const userRoleList = await this.getUserRoles(id);
    
    const rolesWithDetails = await Promise.all(
      userRoleList.map(async (ur) => {
        const role = await this.getRole(ur.roleId);
        return role ? {
          ...role,
          assignedAt: ur.assignedAt!,
          expiresAt: ur.expiresAt
        } : null;
      })
    );

    const validRoles = rolesWithDetails.filter(Boolean) as Array<Role & { assignedAt: Date; expiresAt: Date | null }>;
    
    // Collect all permissions from roles
    const permissions: string[] = [];
    validRoles.forEach(role => {
      if (Array.isArray(role.permissions)) {
        permissions.push(...(role.permissions as string[]));
      }
    });

    return {
      ...user,
      roles: validRoles,
      permissions: [...new Set(permissions)] // Remove duplicates
    };
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(asc(users.createdAt));
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const result = await db.update(users).set({ ...user, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Delete related records first
      await db.delete(userRoles).where(eq(userRoles.userId, id));
      await db.delete(userSessions).where(eq(userSessions.userId, id));
      
      // Delete user
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Authentication methods
  async resetLoginAttempts(userId: number): Promise<void> {
    await db.update(users)
      .set({ loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  async incrementLoginAttempts(userId: number): Promise<number> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');
    
    const newAttempts = (user.loginAttempts || 0) + 1;
    await db.update(users)
      .set({ loginAttempts: newAttempts })
      .where(eq(users.id, userId));
    
    return newAttempts;
  }

  async lockUserAccount(userId: number, lockUntil: Date): Promise<void> {
    await db.update(users)
      .set({ lockedUntil: lockUntil })
      .where(eq(users.id, userId));
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Role methods
  async getRoles(): Promise<Role[]> {
    return db.select().from(roles).where(eq(roles.isActive, true)).orderBy(asc(roles.name));
  }

  async getRole(id: number): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return result[0];
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    return result[0];
  }

  async createRole(role: NewRole): Promise<Role> {
    const result = await db.insert(roles).values(role).returning();
    return result[0];
  }

  async updateRole(id: number, role: Partial<Role>): Promise<Role> {
    const result = await db.update(roles).set(role).where(eq(roles.id, id)).returning();
    return result[0];
  }

  async deleteRole(id: number): Promise<boolean> {
    try {
      // Check if role is in use
      const usersWithRole = await db.select().from(userRoles).where(eq(userRoles.roleId, id)).limit(1);
      if (usersWithRole.length > 0) {
        throw new Error('Cannot delete role that is assigned to users');
      }
      
      await db.delete(roles).where(eq(roles.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  }

  // User Role methods
  async getUserRoles(userId: number): Promise<UserRole[]> {
    return db.select().from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.isActive, true)))
      .orderBy(asc(userRoles.assignedAt));
  }

  async assignUserRole(userRole: NewUserRole): Promise<UserRole> {
    const result = await db.insert(userRoles).values(userRole).returning();
    return result[0];
  }

  async removeUserRole(userId: number, roleId: number): Promise<boolean> {
    try {
      await db.update(userRoles)
        .set({ isActive: false })
        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
      return true;
    } catch (error) {
      console.error('Error removing user role:', error);
      return false;
    }
  }

  async updateUserRoles(userId: number, roleIds: number[], assignedBy: number): Promise<UserRole[]> {
    try {
      // Start transaction by disabling all current roles
      await db.update(userRoles)
        .set({ isActive: false })
        .where(eq(userRoles.userId, userId));

      // Assign new roles
      const newRoles = await Promise.all(
        roleIds.map(roleId => 
          db.insert(userRoles).values({
            userId,
            roleId,
            assignedBy,
            isActive: true
          }).returning()
        )
      );

      return newRoles.flat();
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  }

  // Audit Log methods
  async createAuditLog(log: NewUserAuditLog): Promise<UserAuditLog> {
    const result = await db.insert(userAuditLog).values(log).returning();
    return result[0];
  }

  async getAuditLogs(userId?: number, limit: number = 50): Promise<UserAuditLog[]> {
    let query = db.select().from(userAuditLog);
    
    if (userId) {
      query = query.where(eq(userAuditLog.targetUserId, userId));
    }
    
    return query.orderBy(desc(userAuditLog.timestamp)).limit(limit);
  }

  // Session methods
  async createSession(session: NewUserSession): Promise<UserSession> {
    const result = await db.insert(userSessions).values(session).returning();
    return result[0];
  }

  async getSession(sessionId: string): Promise<UserSession | undefined> {
    const result = await db.select().from(userSessions).where(eq(userSessions.id, sessionId)).limit(1);
    return result[0];
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await db.update(userSessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(userSessions.id, sessionId));
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await db.update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.id, sessionId));
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  async getUserSessions(userId: number): Promise<UserSession[]> {
    return db.select().from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.lastActivityAt));
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async getTopProducts(limit: number = 10): Promise<Product[]> {
    return db.select().from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.rating))
      .limit(limit);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    return db.select().from(vendors);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(vendor).returning();
    return result[0];
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.orderDate));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.registrationDate));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(customer).returning();
    return result[0];
  }

  // Review methods
  async getReviews(): Promise<Review[]> {
    return db.select().from(reviews).orderBy(desc(reviews.reviewDate));
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.reviewDate));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getReviewAnalytics(): Promise<any> {
    const totalReviews = await db.select({ count: sql<number>`count(*)` }).from(reviews);
    const avgRating = await db.select({ avg: sql<number>`avg(rating)` }).from(reviews);
    
    return {
      total: totalReviews[0]?.count || 0,
      averageRating: Number(avgRating[0]?.avg || 0),
      distribution: {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      }
    };
  }

  // Marketing Campaign methods
  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    return db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.startDate));
  }

  async createMarketingCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const result = await db.insert(marketingCampaigns).values(campaign).returning();
    return result[0];
  }

  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    return db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const result = await db.insert(alerts).values(alert).returning();
    return result[0];
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const result = await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id)).returning();
    return result[0];
  }

  // Sales Metrics methods
  async getSalesMetrics(): Promise<SalesMetric[]> {
    return db.select().from(salesMetrics).orderBy(desc(salesMetrics.date));
  }

  async createSalesMetric(metric: InsertSalesMetric): Promise<SalesMetric> {
    const result = await db.insert(salesMetrics).values(metric).returning();
    return result[0];
  }

  async getDashboardMetrics(): Promise<any> {
    const totalSales = await db.select({ total: sql<number>`sum(total_sales)` }).from(salesMetrics);
    const totalOrders = await db.select({ total: sql<number>`sum(total_orders)` }).from(salesMetrics);
    
    return {
      totalSales: totalSales[0]?.total || 0,
      totalOrders: totalOrders[0]?.total || 0,
      averageOrderValue: 0,
      returnRate: 0,
      conversion: 0
    };
  }
}