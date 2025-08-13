import { eq, desc, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

export class DatabaseStorage {
  constructor(private db: NodePgDatabase<typeof schema>) {}

  async getDashboardMetrics() {
    // Get total sales
    const salesResult = await this.db
      .select({
        total: sql<string>`sum(${schema.orders.total})`,
        count: sql<string>`count(*)`,
      })
      .from(schema.orders);

    // Get total customers
    const customersResult = await this.db
      .select({
        count: sql<string>`count(*)`,
      })
      .from(schema.customers);

    // Get total products
    const productsResult = await this.db
      .select({
        count: sql<string>`count(*)`,
      })
      .from(schema.products);

    // Get average rating
    const reviewsResult = await this.db
      .select({
        avg: sql<string>`avg(${schema.reviews.rating})`,
      })
      .from(schema.reviews);

    return {
      totalSales: salesResult[0]?.total || "0",
      totalOrders: salesResult[0]?.count || "0",
      totalCustomers: customersResult[0]?.count || "0",
      totalProducts: productsResult[0]?.count || "0",
      averageRating: reviewsResult[0]?.avg || "0",
    };
  }

  async getProducts() {
    return await this.db
      .select()
      .from(schema.products)
      .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .leftJoin(schema.vendors, eq(schema.products.vendorId, schema.vendors.id))
      .orderBy(desc(schema.products.id));
  }

  async getTopProducts() {
    return await this.db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        sku: schema.products.sku,
        price: schema.products.price,
        stock: schema.products.stock,
        sales: sql<number>`coalesce(sum(${schema.orderItems.quantity}), 0)`,
        revenue: sql<string>`coalesce(sum(${schema.orderItems.quantity} * ${schema.orderItems.price}), 0)`,
      })
      .from(schema.products)
      .leftJoin(schema.orderItems, eq(schema.products.id, schema.orderItems.productId))
      .groupBy(schema.products.id)
      .orderBy(desc(sql`coalesce(sum(${schema.orderItems.quantity}), 0)`))
      .limit(10);
  }

  async getCategories() {
    return await this.db.select().from(schema.categories);
  }

  async getVendors() {
    return await this.db.select().from(schema.vendors);
  }

  async getSalesMetrics() {
    return await this.db
      .select()
      .from(schema.salesMetrics)
      .orderBy(desc(schema.salesMetrics.date))
      .limit(30);
  }

  async getCustomers() {
    return await this.db
      .select()
      .from(schema.customers)
      .orderBy(desc(schema.customers.id));
  }

  async getCustomerMetrics() {
    const totalCustomers = await this.db
      .select({ count: sql<string>`count(*)` })
      .from(schema.customers);

    const newCustomers = await this.db
      .select({ count: sql<string>`count(*)` })
      .from(schema.customers)
      .where(sql`${schema.customers.createdAt} >= NOW() - INTERVAL '30 days'`);

    const avgOrderValue = await this.db
      .select({ avg: sql<string>`avg(${schema.orders.total})` })
      .from(schema.orders);

    return {
      total: totalCustomers[0]?.count || "0",
      newThisMonth: newCustomers[0]?.count || "0",
      averageOrderValue: avgOrderValue[0]?.avg || "0",
    };
  }

  async getReviews() {
    return await this.db
      .select()
      .from(schema.reviews)
      .leftJoin(schema.products, eq(schema.reviews.productId, schema.products.id))
      .leftJoin(schema.customers, eq(schema.reviews.customerId, schema.customers.id))
      .orderBy(desc(schema.reviews.createdAt));
  }

  async getReviewAnalytics() {
    const analytics = await this.db
      .select({
        total: sql<string>`count(*)`,
        averageRating: sql<number>`avg(${schema.reviews.rating})`,
        distribution: sql<any>`json_object(
          '5', count(case when ${schema.reviews.rating} = 5 then 1 end),
          '4', count(case when ${schema.reviews.rating} = 4 then 1 end),
          '3', count(case when ${schema.reviews.rating} = 3 then 1 end),
          '2', count(case when ${schema.reviews.rating} = 2 then 1 end),
          '1', count(case when ${schema.reviews.rating} = 1 then 1 end)
        )`,
      })
      .from(schema.reviews);

    const result = analytics[0];
    return {
      total: result?.total || "0",
      averageRating: result?.averageRating || 0,
      distribution: result?.distribution || { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
    };
  }

  async getSentimentData() {
    // Generate mock sentiment data for demonstration
    const baseTime = Date.now();
    const data = [];
    
    for (let i = 0; i < 100; i++) {
      data.push({
        score: Math.floor(Math.random() * 100),
        timestamp: new Date(baseTime - i * 60000).toISOString(),
      });
    }
    
    return data.reverse();
  }

  async getMarketingCampaigns() {
    return await this.db
      .select()
      .from(schema.marketingCampaigns)
      .orderBy(desc(schema.marketingCampaigns.startDate));
  }

  async getAlerts() {
    return await this.db
      .select()
      .from(schema.alerts)
      .orderBy(desc(schema.alerts.createdAt))
      .limit(50);
  }
}