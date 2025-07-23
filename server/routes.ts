import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authRouter } from "./authRoutes";
import { userManagementRouter } from "./userManagement";
import { authenticateToken, type AuthRequest } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.use("/api/auth", authRouter);
  
  // User management routes (protected)
  app.use("/api/admin", authenticateToken, userManagementRouter);

  // Dashboard metrics (temporarily unprotected for development)
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Sentiment Analysis Endpoints
  app.get("/api/sentiment/updates", async (req, res) => {
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Mock real-time sentiment data generator
    const sendSentimentUpdate = () => {
      const mockData = {
        score: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
        reviewId: Math.floor(Math.random() * 10000),
        productId: Math.floor(Math.random() * 20) + 1,
        productName: `Product ${Math.floor(Math.random() * 20) + 1}`,
        reviewText: generateMockReview(),
        sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
        keywords: generateKeywords()
      };

      res.write(`data: ${JSON.stringify(mockData)}\n\n`);
    };

    // Send updates every 3-5 seconds
    const interval = setInterval(sendSentimentUpdate, Math.random() * 2000 + 3000);

    // Clean up on connection close
    req.on('close', () => {
      clearInterval(interval);
    });
  });

  app.get("/api/reviews/sentiment", async (req, res) => {
    try {
      // Generate mock sentiment data for initial load
      const mockSentimentData = Array.from({ length: 50 }, (_, i) => ({
        score: Math.floor(Math.random() * 100),
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        reviewId: i + 1,
        productId: Math.floor(Math.random() * 20) + 1,
        productName: `Product ${Math.floor(Math.random() * 20) + 1}`,
        reviewText: generateMockReview(),
        sentiment: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
        keywords: generateKeywords()
      }));
      
      res.json(mockSentimentData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sentiment data" });
    }
  });

  // Product comparison endpoint
  app.get("/api/products/:id1/compare/:id2/sentiment", async (req, res) => {
    try {
      const { id1, id2 } = req.params;
      
      // Mock comparison data
      const comparisonData = {
        product1: {
          id: parseInt(id1),
          name: `Product ${id1}`,
          averageScore: Math.floor(Math.random() * 40) + 60,
          totalReviews: Math.floor(Math.random() * 500) + 100,
          commonComplaints: ['shipping', 'quality', 'price'],
          responseTime: Math.floor(Math.random() * 24) + 1
        },
        product2: {
          id: parseInt(id2),
          name: `Product ${id2}`,
          averageScore: Math.floor(Math.random() * 40) + 60,
          totalReviews: Math.floor(Math.random() * 500) + 100,
          commonComplaints: ['packaging', 'delivery', 'support'],
          responseTime: Math.floor(Math.random() * 24) + 1
        }
      };
      
      res.json(comparisonData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comparison data" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/top", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const products = await storage.getTopProducts(limit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Sales metrics
  app.get("/api/sales/metrics", async (req, res) => {
    try {
      const metrics = await storage.getSalesMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales metrics" });
    }
  });

  // Alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.markAlertAsRead(id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  // Reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/analytics", async (req, res) => {
    try {
      const analytics = await storage.getReviewAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch review analytics" });
    }
  });

  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product reviews" });
    }
  });

  // Marketing campaigns
  app.get("/api/marketing/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getMarketingCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch marketing campaigns" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/analytics", async (req, res) => {
    try {
      // Mock customer analytics for now
      const analytics = {
        totalCustomers: 1250,
        newCustomers: 89,
        returningCustomers: 456,
        avgOrderValue: 67.89,
        segments: [
          { name: 'High Value', count: 125, percentage: 10 },
          { name: 'Regular', count: 875, percentage: 70 },
          { name: 'New', count: 250, percentage: 20 }
        ]
      };
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer analytics" });
    }
  });

  // Product sentiment analysis endpoints
  app.get("/api/products/:id/sentiment-trend", async (req, res) => {
    try {
      const { id } = req.params;
      const { timeframe = '30d' } = req.query;
      
      // Generate mock sentiment trend data
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const trendData = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        
        return {
          date: date.toISOString(),
          score: Math.max(20, Math.min(95, 70 + Math.sin(i * 0.1) * 15 + (Math.random() - 0.5) * 10)),
          reviewCount: Math.floor(Math.random() * 10) + 1
        };
      });
      
      res.json(trendData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sentiment trend" });
    }
  });

  app.get("/api/products/:id/complaints", async (req, res) => {
    try {
      const complaints = [
        { keyword: "slow delivery", frequency: 23, impact: "high" },
        { keyword: "packaging", frequency: 18, impact: "medium" },
        { keyword: "customer service", frequency: 15, impact: "high" },
        { keyword: "quality", frequency: 12, impact: "medium" },
        { keyword: "price", frequency: 8, impact: "low" }
      ];
      
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch complaints" });
    }
  });

  app.get("/api/products/:id/response-metrics", async (req, res) => {
    try {
      const metrics = {
        avgResponseTime: Math.floor(Math.random() * 48) + 2, // 2-50 hours
        responseRate: Math.floor(Math.random() * 30) + 70, // 70-100%
        escalationRate: Math.floor(Math.random() * 25) + 5 // 5-30%
      };
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch response metrics" });
    }
  });

  // Alert management endpoints
  app.patch("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const { id } = req.params;
      // In a real app, update the database
      res.json({ success: true, message: "Alert resolved" });
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve alert" });
    }
  });

  // WebSocket endpoint for real-time alerts
  app.get("/api/alerts/stream", (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    const sendAlert = () => {
      const alertTypes = ['critical', 'warning', 'info'];
      const titles = [
        'Low sentiment detected',
        'Product review spike',
        'Customer service delay',
        'Inventory alert',
        'Marketing campaign performance'
      ];
      const descriptions = [
        'Product sentiment has dropped below threshold',
        'Sudden increase in product reviews detected',
        'Response times exceeding 24 hours',
        'Stock levels critically low',
        'Campaign ROI below expected performance'
      ];

      const alert = {
        id: Date.now(),
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        title: titles[Math.floor(Math.random() * titles.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        timestamp: new Date().toISOString(),
        productId: Math.floor(Math.random() * 20) + 1,
        resolved: false,
        metadata: {
          productName: 'Sample Product',
          sentimentScore: Math.floor(Math.random() * 100),
          responseTime: Math.floor(Math.random() * 48) + 1
        }
      };

      res.write(`data: ${JSON.stringify(alert)}\n\n`);
    };

    // Send initial alert
    setTimeout(sendAlert, 2000);
    
    // Send periodic alerts
    const interval = setInterval(sendAlert, 15000); // Every 15 seconds

    req.on('close', () => {
      clearInterval(interval);
    });
  });

  const server = createServer(app);
  return server;
}

// Helper functions for mock data generation
function generateMockReview(): string {
  const reviews = [
    "Great product, fast shipping and excellent quality!",
    "Not satisfied with the quality, expected better for the price.",
    "Good value for money, will order again.",
    "Product arrived damaged, poor packaging.",
    "Excellent customer service, quick response to issues.",
    "Average product, nothing special but works as expected.",
    "Love this product! Exceeded my expectations.",
    "Shipping was slow but product quality is good.",
    "Poor quality control, received defective item.",
    "Outstanding product quality and fast delivery!"
  ];
  return reviews[Math.floor(Math.random() * reviews.length)];
}

function generateKeywords(): string[] {
  const allKeywords = ['quality', 'shipping', 'price', 'delivery', 'packaging', 'support', 'value', 'fast', 'slow', 'excellent', 'poor', 'good'];
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = allKeywords.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}