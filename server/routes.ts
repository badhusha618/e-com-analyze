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

  // Dashboard metrics endpoint
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      res.json(mockData.dashboardMetrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      res.json(mockData.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/top", async (req, res) => {
    try {
      res.json(mockData.products.slice(0, 5)); // Top 5 products
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Internal server error" });
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