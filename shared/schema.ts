import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // user, admin
  isActive: boolean("is_active").default(true),
  isSuspended: boolean("is_suspended").default(false),
  isExternal: boolean("is_external").default(false), // For OAuth/JIT users
  lastLoginAt: timestamp("last_login_at"),
  passwordChangedAt: timestamp("password_changed_at").defaultNow(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  loginAttempts: integer("login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  sessionTimeout: integer("session_timeout").default(8), // hours
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced role system
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // SUPER_ADMIN, USER_ADMIN, READER, EXTERNAL_USER
  description: text("description"),
  permissions: jsonb("permissions").notNull(), // Array of permission strings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roleId: integer("role_id").notNull(),
  assignedBy: integer("assigned_by"), // User ID who assigned this role
  assignedAt: timestamp("assigned_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // For temporal access
  isActive: boolean("is_active").default(true),
});

// Audit logging
export const userAuditLog = pgTable("user_audit_log", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  targetUserId: integer("target_user_id"),
  action: text("action").notNull(), // CREATE_USER, UPDATE_ROLES, DELETE_USER, etc.
  entityType: text("entity_type").notNull(), // USER, ROLE, PERMISSION
  entityId: integer("entity_id"),
  beforeValues: jsonb("before_values"),
  afterValues: jsonb("after_values"),
  changeSummary: text("change_summary"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }), // AI anomaly score
  isAnomalous: boolean("is_anomalous").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// JIT Provisioning rules
export const jitProvisioningRules = pgTable("jit_provisioning_rules", {
  id: serial("id").primaryKey(),
  providerName: text("provider_name").notNull(), // google, github, etc.
  emailDomain: text("email_domain"), // @company.com
  claimMapping: jsonb("claim_mapping").notNull(), // Map provider claims to roles
  defaultRoleId: integer("default_role_id").notNull(),
  requiresApproval: boolean("requires_approval").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pending user approvals
export const pendingUserApprovals = pgTable("pending_user_approvals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  providerClaims: jsonb("provider_claims").notNull(),
  requestedRoles: jsonb("requested_roles").notNull(),
  status: text("status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewReason: text("review_reason"),
  expiresAt: timestamp("expires_at").defaultNow(), // Auto-reject after 7 days
  createdAt: timestamp("created_at").defaultNow(),
});

// Change requests for approval workflow
export const userChangeRequests = pgTable("user_change_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  targetUserId: integer("target_user_id"),
  changeType: text("change_type").notNull(), // CREATE_USER, UPDATE_ROLES, DELETE_USER
  proposedChanges: jsonb("proposed_changes").notNull(),
  currentValues: jsonb("current_values"),
  justification: text("justification"),
  status: text("status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED, EXPIRED
  approverId: integer("approver_id"),
  approvedAt: timestamp("approved_at"),
  approvalReason: text("approval_reason"),
  rejectionReason: text("rejection_reason"),
  expiresAt: timestamp("expires_at"), // 72 hours default
  emergencyRequest: boolean("emergency_request").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Anomaly detection models
export const anomalyDetectionModels = pgTable("anomaly_detection_models", {
  id: serial("id").primaryKey(),
  modelName: text("model_name").notNull(),
  modelType: text("model_type").notNull(), // isolation_forest, autoencoder
  modelParameters: jsonb("model_parameters").notNull(),
  trainingData: jsonb("training_data"),
  accuracy: decimal("accuracy", { precision: 5, scale: 4 }),
  lastTrained: timestamp("last_trained"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session management
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(), // JWT token ID
  userId: integer("user_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"), // Geolocation
  deviceFingerprint: text("device_fingerprint"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  inventory: integer("inventory").notNull().default(0),
  categoryId: integer("category_id"),
  vendorId: integer("vendor_id"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // pending, processing, shipped, delivered, cancelled
  orderDate: timestamp("order_date").defaultNow(),
  shippedDate: timestamp("shipped_date"),
  deliveredDate: timestamp("delivered_date"),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  registrationDate: timestamp("registration_date").defaultNow(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  orderCount: integer("order_count").default(0),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  customerId: integer("customer_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  content: text("content"),
  sentiment: text("sentiment"), // positive, negative, neutral
  isVerified: boolean("is_verified").default(false),
  vendorResponse: text("vendor_response"),
  reviewDate: timestamp("review_date").defaultNow(),
});

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  channel: text("channel").notNull(), // google_ads, facebook_ads, email, influencer
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  clicks: integer("clicks").default(0),
  impressions: integer("impressions").default(0),
  conversions: integer("conversions").default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // sales_drop, review_spike, inventory_low, campaign_underperform
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(), // low, medium, high
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"), // Additional data specific to alert type
});

export const salesMetrics = pgTable("sales_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).notNull(),
  totalOrders: integer("total_orders").notNull(),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).notNull(),
  returnRate: decimal("return_rate", { precision: 5, scale: 4 }).notNull(),
  newCustomers: integer("new_customers").default(0),
});

// Insert schemas
export const insertProductSchema = createInsertSchema(products);
export const insertCategorySchema = createInsertSchema(categories);
export const insertVendorSchema = createInsertSchema(vendors);
export const insertOrderSchema = createInsertSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertCustomerSchema = createInsertSchema(customers);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns);
export const insertAlertSchema = createInsertSchema(alerts);
export const insertSalesMetricSchema = createInsertSchema(salesMetrics);
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Export types for authentication
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type SalesMetric = typeof salesMetrics.$inferSelect;
export type InsertSalesMetric = z.infer<typeof insertSalesMetricSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

// Enhanced user management schemas
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, assignedAt: true });
export const insertUserAuditLogSchema = createInsertSchema(userAuditLog).omit({ id: true, timestamp: true });
export const insertJitProvisioningRuleSchema = createInsertSchema(jitProvisioningRules).omit({ id: true, createdAt: true });
export const insertPendingUserApprovalSchema = createInsertSchema(pendingUserApprovals).omit({ id: true, createdAt: true });
export const insertUserChangeRequestSchema = createInsertSchema(userChangeRequests).omit({ id: true, createdAt: true });
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ createdAt: true, lastActivityAt: true });

export const createUserSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number and special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateUserRolesSchema = z.object({
  userId: z.number(),
  roleIds: z.array(z.number()),
  justification: z.string().min(10, "Justification required"),
  emergencyRequest: z.boolean().default(false),
});

export const jitUserProvisioningSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  providerClaims: z.record(z.any()),
  providerId: z.string(),
  providerName: z.string(),
});

// Enhanced types
export type Role = typeof roles.$inferSelect;
export type NewRole = z.infer<typeof insertRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserAuditLog = typeof userAuditLog.$inferSelect;
export type NewUserAuditLog = z.infer<typeof insertUserAuditLogSchema>;
export type JitProvisioningRule = typeof jitProvisioningRules.$inferSelect;
export type NewJitProvisioningRule = z.infer<typeof insertJitProvisioningRuleSchema>;
export type PendingUserApproval = typeof pendingUserApprovals.$inferSelect;
export type NewPendingUserApproval = z.infer<typeof insertPendingUserApprovalSchema>;
export type UserChangeRequest = typeof userChangeRequests.$inferSelect;
export type NewUserChangeRequest = z.infer<typeof insertUserChangeRequestSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = z.infer<typeof insertUserSessionSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;

// Permission constants
export const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_ROLES_UPDATE: 'user:roles:update',
  
  // Role management
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // Admin operations
  ADMIN_AUDIT_READ: 'admin:audit:read',
  ADMIN_SYSTEM_CONFIG: 'admin:system:config',
  ADMIN_EMERGENCY_ACCESS: 'admin:emergency:access',
  
  // Dashboard access
  DASHBOARD_READ: 'dashboard:read',
  DASHBOARD_WRITE: 'dashboard:write',
  
  // Analytics
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
