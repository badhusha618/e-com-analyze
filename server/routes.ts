import { Express } from "express";

// Mock data for now - will connect to real database later
const mockData = {
  dashboardMetrics: {
    totalSales: "125,847.50",
    totalOrders: "432",
    totalCustomers: "186",
    totalProducts: "24",
    averageRating: "4.2"
  },
  products: [
    { id: 1, name: "iPhone 15 Pro", sku: "APL-IPH15P", price: "999.00", stock: 50, category: { name: "Electronics" }, vendor: { name: "Apple" } },
    { id: 2, name: "Samsung Galaxy S24", sku: "SAM-GS24", price: "899.00", stock: 30, category: { name: "Electronics" }, vendor: { name: "Samsung" } }
  ],
  categories: [
    { id: 1, name: "Electronics", description: "Electronic devices" },
    { id: 2, name: "Fashion", description: "Clothing and accessories" }
  ],
  vendors: [
    { id: 1, name: "Apple Inc.", email: "contact@apple.com" },
    { id: 2, name: "Samsung Electronics", email: "info@samsung.com" }
  ]
};

export async function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // Dashboard metrics endpoint (Spring Boot compatible format)
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = {
        totalSales: "$125,847.50",
        totalOrders: 432,
        totalCustomers: 186,
        averageOrderValue: 291.23,
        conversionRate: 3.8,
        unreadAlerts: 7
      };
      res.json({
        success: true,
        data: metrics,
        message: "Dashboard metrics retrieved successfully"
      });
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch dashboard metrics" 
      });
    }
  });

  // Products endpoints (Spring Boot compatible format)
  app.get("/api/products", async (req, res) => {
    try {
      const products = [
        { id: 1, name: "iPhone 15 Pro", sku: "APL-IPH15-PRO-256", price: 999.99, inventory: 50, categoryName: "Electronics", vendorName: "Apple Inc.", rating: 4.8, reviewCount: 124, totalRevenue: 49995.00, unitsSold: 50 },
        { id: 2, name: "Samsung Galaxy Watch", sku: "SAM-GW-6-44MM", price: 299.99, inventory: 75, categoryName: "Electronics", vendorName: "Samsung", rating: 4.2, reviewCount: 89, totalRevenue: 22499.25, unitsSold: 75 },
        { id: 3, name: "Designer Jeans", sku: "FF-JEANS-SLIM-32", price: 89.99, inventory: 120, categoryName: "Clothing", vendorName: "Fashion Forward", rating: 3.9, reviewCount: 45, totalRevenue: 10798.80, unitsSold: 120 },
        { id: 4, name: "Garden Tool Set", sku: "HG-TOOLS-SET-PRO", price: 45.99, inventory: 35, categoryName: "Home & Garden", vendorName: "Home & Garden Co", rating: 4.5, reviewCount: 67, totalRevenue: 1609.65, unitsSold: 35 },
        { id: 5, name: "Running Shoes", sku: "SC-SHOES-RUN-10", price: 129.99, inventory: 85, categoryName: "Sports & Outdoors", vendorName: "Sports Central", rating: 4.7, reviewCount: 156, totalRevenue: 11049.15, unitsSold: 85 }
      ];
      res.json({
        success: true,
        data: {
          content: products,
          totalElements: products.length,
          totalPages: 1,
          size: 10,
          number: 0
        },
        message: "Products retrieved successfully"
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ success: false, error: "Failed to fetch products" });
    }
  });

  // Top selling products endpoint
  app.get("/api/products/top-selling", async (req, res) => {
    try {
      const topProducts = [
        { id: 1, name: "iPhone 15 Pro", sku: "APL-IPH15-PRO-256", price: 999.99, inventory: 50, categoryName: "Electronics", vendorName: "Apple Inc.", rating: 4.8, reviewCount: 124, totalRevenue: 49995.00, unitsSold: 50 },
        { id: 5, name: "Running Shoes", sku: "SC-SHOES-RUN-10", price: 129.99, inventory: 85, categoryName: "Sports & Outdoors", vendorName: "Sports Central", rating: 4.7, reviewCount: 156, totalRevenue: 11049.15, unitsSold: 85 },
        { id: 2, name: "Samsung Galaxy Watch", sku: "SAM-GW-6-44MM", price: 299.99, inventory: 75, categoryName: "Electronics", vendorName: "Samsung", rating: 4.2, reviewCount: 89, totalRevenue: 22499.25, unitsSold: 75 }
      ];
      res.json({
        success: true,
        data: topProducts,
        message: "Top selling products retrieved successfully"
      });
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ success: false, error: "Failed to fetch top products" });
    }
  });

  // Categories endpoint
  app.get("/api/categories", async (req, res) => {
    try {
      res.json(mockData.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Vendors endpoint
  app.get("/api/vendors", async (req, res) => {
    try {
      res.json(mockData.vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sales chart data endpoint (Spring Boot format)
  app.get("/api/dashboard/sales-chart", async (req, res) => {
    try {
      const salesData = [
        { date: "2024-01-15", sales: 15432.67, orders: 56, averageOrderValue: 275.58 },
        { date: "2024-01-16", sales: 12999.85, orders: 45, averageOrderValue: 288.89 },
        { date: "2024-01-17", sales: 18750.23, orders: 67, averageOrderValue: 279.85 },
        { date: "2024-01-18", sales: 14321.45, orders: 52, averageOrderValue: 275.41 },
        { date: "2024-01-19", sales: 16890.12, orders: 61, averageOrderValue: 276.89 },
        { date: "2024-01-20", sales: 19245.78, orders: 71, averageOrderValue: 271.05 },
        { date: "2024-01-21", sales: 21567.34, orders: 78, averageOrderValue: 276.50 }
      ];
      res.json({
        success: true,
        data: salesData,
        message: "Sales chart data retrieved successfully"
      });
    } catch (error) {
      console.error("Error fetching sales chart data:", error);
      res.status(500).json({ success: false, error: "Failed to fetch sales chart data" });
    }
  });

  // Sales metrics endpoint
  app.get("/api/sales/metrics", async (req, res) => {
    try {
      const salesMetrics = [
        { id: 1, date: "2024-01-15", revenue: "5200.00", orders: 42, customers: 28 },
        { id: 2, date: "2024-01-16", revenue: "4800.00", orders: 38, customers: 25 },
        { id: 3, date: "2024-01-17", revenue: "6100.00", orders: 51, customers: 34 }
      ];
      res.json(salesMetrics);
    } catch (error) {
      console.error("Error fetching sales metrics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customers endpoints
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = [
        { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", phone: "+1-555-0101" },
        { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "+1-555-0102" }
      ];
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/customers/metrics", async (req, res) => {
    try {
      const metrics = {
        total: "186",
        newThisMonth: "24",
        averageOrderValue: "142.50"
      };
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching customer metrics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reviews endpoints
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = [
        { id: 1, productId: 1, customerId: 1, rating: 5, comment: "Great product!", createdAt: "2024-01-15" },
        { id: 2, productId: 2, customerId: 2, rating: 4, comment: "Good value for money", createdAt: "2024-01-16" }
      ];
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/analytics", async (req, res) => {
    try {
      const analytics = {
        total: "156",
        averageRating: 4.2,
        distribution: { "5": 65, "4": 42, "3": 28, "2": 15, "1": 6 }
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching review analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/sentiment", async (req, res) => {
    try {
      const sentimentData = Array.from({ length: 50 }, (_, i) => ({
        score: Math.floor(Math.random() * 100),
        timestamp: new Date(Date.now() - i * 60000).toISOString()
      }));
      res.json(sentimentData.reverse());
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Marketing campaigns endpoint
  app.get("/api/marketing/campaigns", async (req, res) => {
    try {
      const campaigns = [
        { id: 1, name: "Summer Sale 2024", budget: "10000.00", spent: "7500.00", revenue: "45000.00", status: "active" },
        { id: 2, name: "Winter Fashion", budget: "5000.00", spent: "4200.00", revenue: "18000.00", status: "active" }
      ];
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching marketing campaigns:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Alerts endpoint
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = [
        { id: 1, type: "inventory", title: "Low Stock Alert", message: "Samsung Galaxy S24 stock is running low", severity: "warning", isRead: false },
        { id: 2, type: "sales", title: "Sales Milestone", message: "You have reached $50,000 in sales this month", severity: "info", isRead: false }
      ];
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}