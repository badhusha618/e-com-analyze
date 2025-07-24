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

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(identifier: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserWithRoles(id: number): Promise<UserWithRoles | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  
  // Authentication methods
  resetLoginAttempts(userId: number): Promise<void>;
  incrementLoginAttempts(userId: number): Promise<number>;
  lockUserAccount(userId: number, lockUntil: Date): Promise<void>;
  updateLastLogin(userId: number): Promise<void>;
  
  // Roles
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(role: NewRole): Promise<Role>;
  updateRole(id: number, role: Partial<Role>): Promise<Role>;
  deleteRole(id: number): Promise<boolean>;
  
  // User Roles
  getUserRoles(userId: number): Promise<UserRole[]>;
  assignUserRole(userRole: NewUserRole): Promise<UserRole>;
  removeUserRole(userId: number, roleId: number): Promise<boolean>;
  updateUserRoles(userId: number, roleIds: number[], assignedBy: number): Promise<UserRole[]>;
  
  // Audit Log
  createAuditLog(log: NewUserAuditLog): Promise<UserAuditLog>;
  getAuditLogs(userId?: number, limit?: number): Promise<UserAuditLog[]>;
  
  // Sessions
  createSession(session: NewUserSession): Promise<UserSession>;
  getSession(sessionId: string): Promise<UserSession | undefined>;
  updateSessionActivity(sessionId: string): Promise<void>;
  deleteSession(sessionId: string): Promise<boolean>;
  getUserSessions(userId: number): Promise<UserSession[]>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  getTopProducts(limit?: number): Promise<Product[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Vendors
  getVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;

  // Orders
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Reviews
  getReviews(): Promise<Review[]>;
  getProductReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getReviewAnalytics(): Promise<any>;

  // Marketing Campaigns
  getMarketingCampaigns(): Promise<MarketingCampaign[]>;
  createMarketingCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<Alert | undefined>;

  // Sales Metrics
  getSalesMetrics(): Promise<SalesMetric[]>;
  createSalesMetric(metric: InsertSalesMetric): Promise<SalesMetric>;
  getDashboardMetrics(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private vendors: Map<number, Vendor>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private customers: Map<number, Customer>;
  private reviews: Map<number, Review>;
  private marketingCampaigns: Map<number, MarketingCampaign>;
  private alerts: Map<number, Alert>;
  private salesMetrics: Map<number, SalesMetric>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.vendors = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.customers = new Map();
    this.reviews = new Map();
    this.marketingCampaigns = new Map();
    this.alerts = new Map();
    this.salesMetrics = new Map();
    this.currentId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample categories
    const sampleCategories = [
      { name: "Electronics", description: "Electronic devices and accessories" },
      { name: "Gaming", description: "Gaming equipment and accessories" },
      { name: "Wearables", description: "Smart watches and fitness trackers" },
      { name: "Computer Accessories", description: "Keyboards, mice, and peripherals" }
    ];

    sampleCategories.forEach(category => {
      const id = this.currentId++;
      this.categories.set(id, { 
        id, 
        ...category,
        description: category.description || null
      } as Category);
    });

    // Sample vendors
    const sampleVendors = [
      { name: "TechCorp", email: "contact@techcorp.com", phone: "+1-555-0101", rating: "4.5" },
      { name: "GameSupply", email: "sales@gamesupply.com", phone: "+1-555-0102", rating: "4.2" },
      { name: "WearableTech", email: "info@wearabletech.com", phone: "+1-555-0103", rating: "4.7" },
      { name: "AccessoryPro", email: "support@accessorypro.com", phone: "+1-555-0104", rating: "4.0" }
    ];

    sampleVendors.forEach(vendor => {
      const id = this.currentId++;
      this.vendors.set(id, { 
        id, 
        ...vendor,
        email: vendor.email || null,
        phone: vendor.phone || null,
        rating: vendor.rating || "0"
      } as Vendor);
    });

    // Sample products
    const sampleProducts = [
      { name: "Premium Headphones", sku: "PHD-001", price: "199.99", costPrice: "120.00", inventory: 456, rating: "4.8", reviewCount: 234, categoryId: 1, vendorId: 1 },
      { name: "Wireless Mouse", sku: "WM-002", price: "29.99", costPrice: "18.00", inventory: 234, rating: "4.6", reviewCount: 156, categoryId: 4, vendorId: 4 },
      { name: "Gaming Keyboard", sku: "GK-003", price: "79.99", costPrice: "45.00", inventory: 12, rating: "3.2", reviewCount: 89, categoryId: 2, vendorId: 2 },
      { name: "Smart Watch", sku: "SW-004", price: "299.99", costPrice: "180.00", inventory: 78, rating: "4.7", reviewCount: 312, categoryId: 3, vendorId: 3 },
      { name: "Bluetooth Speaker", sku: "BS-005", price: "89.99", costPrice: "52.00", inventory: 156, rating: "4.4", reviewCount: 178, categoryId: 1, vendorId: 1 },
      { name: "Gaming Monitor", sku: "GM-006", price: "349.99", costPrice: "210.00", inventory: 45, rating: "4.6", reviewCount: 245, categoryId: 2, vendorId: 2 },
      { name: "Fitness Tracker", sku: "FT-007", price: "149.99", costPrice: "85.00", inventory: 89, rating: "4.1", reviewCount: 134, categoryId: 3, vendorId: 3 },
      { name: "Mechanical Keyboard", sku: "MK-008", price: "129.99", costPrice: "75.00", inventory: 67, rating: "4.8", reviewCount: 289, categoryId: 4, vendorId: 4 }
    ];

    sampleProducts.forEach(product => {
      const id = this.currentId++;
      this.products.set(id, { 
        id, 
        ...product, 
        isActive: true, 
        createdAt: new Date() 
      } as Product);
    });

    // Sample sales metrics
    const dates = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    });

    dates.forEach(date => {
      const id = this.currentId++;
      this.salesMetrics.set(id, {
        id,
        date,
        totalSales: (Math.random() * 50000 + 20000).toFixed(2),
        totalOrders: Math.floor(Math.random() * 500 + 200),
        averageOrderValue: (Math.random() * 100 + 150).toFixed(2),
        returnRate: (Math.random() * 0.05 + 0.01).toFixed(4),
        newCustomers: Math.floor(Math.random() * 50 + 20)
      } as SalesMetric);
    });

    // Sample alerts
    const sampleAlerts = [
      { type: "sales_drop", title: "Sales Decline Alert", message: "Sales dropped 15% compared to yesterday", severity: "medium", isRead: false },
      { type: "review_spike", title: "Negative Review Alert", message: "Negative review spike detected for Premium Headphones", severity: "high", isRead: false },
      { type: "inventory_low", title: "Low Inventory Alert", message: "Gaming Keyboard inventory below threshold", severity: "medium", isRead: false }
    ];

    sampleAlerts.forEach(alert => {
      const id = this.currentId++;
      this.alerts.set(id, { 
        id, 
        ...alert, 
        createdAt: new Date(),
        metadata: {}
      } as Alert);
    });

    // Sample marketing campaigns
    const sampleCampaigns = [
      { name: "Google Ads Campaign", channel: "google_ads", budget: "15000.00", spent: "12450.00", revenue: "42330.00", clicks: 2450, impressions: 45000, conversions: 234 },
      { name: "Facebook Ads Campaign", channel: "facebook_ads", budget: "12000.00", spent: "8920.00", revenue: "24976.00", clicks: 1890, impressions: 38000, conversions: 156 },
      { name: "Email Marketing", channel: "email", budget: "5000.00", spent: "3200.00", revenue: "13440.00", clicks: 890, impressions: 12000, conversions: 89 },
      { name: "Influencer Campaign", channel: "influencer", budget: "8000.00", spent: "5800.00", revenue: "11020.00", clicks: 456, impressions: 8900, conversions: 45 }
    ];

    sampleCampaigns.forEach(campaign => {
      const id = this.currentId++;
      this.marketingCampaigns.set(id, { 
        id, 
        ...campaign, 
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      } as MarketingCampaign);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      role: insertUser.role || 'user'
    };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { 
      ...insertProduct,
      id, 
      rating: "0", 
      reviewCount: 0, 
      isActive: true, 
      createdAt: new Date(),
      inventory: insertProduct.inventory || 0,
      categoryId: insertProduct.categoryId || null,
      vendorId: insertProduct.vendorId || null
    };
    this.products.set(id, product);
    return product;
  }

  async getTopProducts(limit: number = 10): Promise<Product[]> {
    const products = Array.from(this.products.values());
    return products
      .sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"))
      .slice(0, limit);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null
    };
    this.categories.set(id, category);
    return category;
  }

  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.currentId++;
    const vendor: Vendor = { 
      ...insertVendor, 
      id, 
      rating: "0",
      email: insertVendor.email || null,
      phone: insertVendor.phone || null
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      orderDate: new Date(),
      shippedDate: insertOrder.shippedDate || null,
      deliveredDate: insertOrder.deliveredDate || null
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      registrationDate: new Date(),
      totalSpent: "0",
      orderCount: 0,
      phone: insertCustomer.phone || null
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.productId === productId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentId++;
    const review: Review = { 
      ...insertReview, 
      id, 
      isVerified: false,
      reviewDate: new Date(),
      title: insertReview.title || null,
      content: insertReview.content || null,
      sentiment: insertReview.sentiment || null,
      vendorResponse: insertReview.vendorResponse || null
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewAnalytics(): Promise<any> {
    const reviews = Array.from(this.reviews.values());
    const total = reviews.length;
    const ratings = [0, 0, 0, 0, 0];
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratings[review.rating - 1]++;
      }
    });

    return {
      total,
      averageRating: total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0,
      distribution: ratings.map((count, index) => ({
        rating: index + 1,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
    };
  }

  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    return Array.from(this.marketingCampaigns.values());
  }

  async createMarketingCampaign(insertCampaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const id = this.currentId++;
    const campaign: MarketingCampaign = { 
      ...insertCampaign, 
      id,
      spent: "0",
      revenue: "0",
      clicks: 0,
      impressions: 0,
      conversions: 0,
      isActive: true,
      endDate: insertCampaign.endDate || null
    };
    this.marketingCampaigns.set(id, campaign);
    return campaign;
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentId++;
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      isRead: false,
      createdAt: new Date(),
      metadata: insertAlert.metadata || {}
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isRead = true;
      this.alerts.set(id, alert);
    }
    return alert;
  }

  async getSalesMetrics(): Promise<SalesMetric[]> {
    return Array.from(this.salesMetrics.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createSalesMetric(insertMetric: InsertSalesMetric): Promise<SalesMetric> {
    const id = this.currentId++;
    const metric: SalesMetric = { 
      ...insertMetric, 
      id,
      newCustomers: insertMetric.newCustomers || null
    };
    this.salesMetrics.set(id, metric);
    return metric;
  }

  async getDashboardMetrics(): Promise<any> {
    const products = Array.from(this.products.values());
    const salesMetrics = Array.from(this.salesMetrics.values());
    const campaigns = Array.from(this.marketingCampaigns.values());
    
    const latestMetric = salesMetrics[0];
    const previousMetric = salesMetrics[1];
    
    const totalSales = latestMetric ? parseFloat(latestMetric.totalSales) : 0;
    const totalOrders = latestMetric ? latestMetric.totalOrders : 0;
    const avgOrderValue = latestMetric ? parseFloat(latestMetric.averageOrderValue) : 0;
    const returnRate = latestMetric ? parseFloat(latestMetric.returnRate) * 100 : 0;
    
    const salesChange = previousMetric ? 
      ((totalSales - parseFloat(previousMetric.totalSales)) / parseFloat(previousMetric.totalSales)) * 100 : 0;
    const ordersChange = previousMetric ? 
      ((totalOrders - previousMetric.totalOrders) / previousMetric.totalOrders) * 100 : 0;
    const aovChange = previousMetric ? 
      ((avgOrderValue - parseFloat(previousMetric.averageOrderValue)) / parseFloat(previousMetric.averageOrderValue)) * 100 : 0;
    const returnRateChange = previousMetric ? 
      ((returnRate - parseFloat(previousMetric.returnRate) * 100) / (parseFloat(previousMetric.returnRate) * 100)) * 100 : 0;

    return {
      totalSales: totalSales.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      totalOrders: totalOrders.toLocaleString(),
      avgOrderValue: avgOrderValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      returnRate: `${returnRate.toFixed(1)}%`,
      salesChange: salesChange.toFixed(1),
      ordersChange: ordersChange.toFixed(1),
      aovChange: aovChange.toFixed(1),
      returnRateChange: returnRateChange.toFixed(1),
      topProducts: products.slice(0, 4),
      salesData: salesMetrics.slice(0, 30).reverse(),
      campaigns: campaigns.filter(c => c.isActive)
    };
  }
}

import { DatabaseStorage } from './dbStorage';

export const storage = new DatabaseStorage();
