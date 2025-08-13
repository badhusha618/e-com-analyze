import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

export async function seedDatabase(db: NodePgDatabase<typeof schema>) {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed roles first (from separate file)
    const { seedRoles } = await import('./seedRoles.js');
    await seedRoles(db);

    // Seed users
    console.log('👥 Seeding users...');
    await db.insert(schema.users).values([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      },
      {
        username: 'user1',
        email: 'user1@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
      },
    ]);

    // Seed vendors
    console.log('🏢 Seeding vendors...');
    await db.insert(schema.vendors).values([
      { name: 'Apple Inc.', email: 'contact@apple.com', phone: '+1-800-APL-CARE' },
      { name: 'Samsung Electronics', email: 'info@samsung.com', phone: '+1-800-SAMSUNG' },
      { name: 'Nike Inc.', email: 'support@nike.com', phone: '+1-800-344-6453' },
      { name: 'Adidas AG', email: 'contact@adidas.com', phone: '+49-9132-84-0' },
      { name: 'Amazon', email: 'seller-support@amazon.com', phone: '+1-206-266-1000' },
    ]);

    // Seed categories
    console.log('📂 Seeding categories...');
    await db.insert(schema.categories).values([
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Fashion', description: 'Clothing and accessories' },
      { name: 'Books', description: 'Books and publications' },
      { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
    ]);

    // Seed products
    console.log('📦 Seeding products...');
    await db.insert(schema.products).values([
      {
        name: 'iPhone 15 Pro',
        sku: 'APL-IPH15P-128',
        description: 'Latest iPhone with Pro features',
        price: '999.00',
        stock: 50,
        categoryId: 1,
        vendorId: 1,
      },
      {
        name: 'Samsung Galaxy S24',
        sku: 'SAM-GS24-256',
        description: 'Premium Android smartphone',
        price: '899.00',
        stock: 30,
        categoryId: 1,
        vendorId: 2,
      },
      {
        name: 'Nike Air Max 90',
        sku: 'NIKE-AM90-10',
        description: 'Classic running shoes',
        price: '120.00',
        stock: 100,
        categoryId: 2,
        vendorId: 3,
      },
      {
        name: 'Adidas Ultraboost 22',
        sku: 'ADS-UB22-9',
        description: 'High-performance running shoes',
        price: '180.00',
        stock: 75,
        categoryId: 2,
        vendorId: 4,
      },
      {
        name: 'The Art of Programming',
        sku: 'BOOK-AOP-001',
        description: 'Comprehensive programming guide',
        price: '49.99',
        stock: 200,
        categoryId: 3,
        vendorId: 5,
      },
    ]);

    // Seed customers
    console.log('👤 Seeding customers...');
    await db.insert(schema.customers).values([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0101',
        address: '123 Main St, Anytown USA',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0102',
        address: '456 Oak Ave, Another City USA',
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@email.com',
        phone: '+1-555-0103',
        address: '789 Pine St, Third Town USA',
      },
    ]);

    // Seed orders
    console.log('📋 Seeding orders...');
    await db.insert(schema.orders).values([
      {
        customerId: 1,
        total: '999.00',
        status: 'completed',
        orderDate: new Date('2024-01-15'),
      },
      {
        customerId: 2,
        total: '1079.00',
        status: 'completed',
        orderDate: new Date('2024-01-16'),
      },
      {
        customerId: 3,
        total: '300.00',
        status: 'pending',
        orderDate: new Date('2024-01-17'),
      },
    ]);

    // Seed order items
    console.log('🛒 Seeding order items...');
    await db.insert(schema.orderItems).values([
      { orderId: 1, productId: 1, quantity: 1, price: '999.00' },
      { orderId: 2, productId: 2, quantity: 1, price: '899.00' },
      { orderId: 2, productId: 3, quantity: 1, price: '120.00' },
      { orderId: 2, productId: 5, quantity: 1, price: '49.99' },
      { orderId: 3, productId: 3, quantity: 2, price: '120.00' },
      { orderId: 3, productId: 4, quantity: 1, price: '180.00' },
    ]);

    // Seed reviews
    console.log('⭐ Seeding reviews...');
    await db.insert(schema.reviews).values([
      {
        productId: 1,
        customerId: 1,
        rating: 5,
        comment: 'Amazing phone! Love the camera quality.',
      },
      {
        productId: 2,
        customerId: 2,
        rating: 4,
        comment: 'Great Android phone, excellent battery life.',
      },
      {
        productId: 3,
        customerId: 3,
        rating: 5,
        comment: 'Comfortable shoes, perfect for running.',
      },
    ]);

    // Seed marketing campaigns
    console.log('📢 Seeding marketing campaigns...');
    await db.insert(schema.marketingCampaigns).values([
      {
        name: 'Summer Sale 2024',
        description: 'Big summer discounts on electronics',
        budget: '10000.00',
        spent: '7500.00',
        revenue: '45000.00',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        status: 'active',
      },
      {
        name: 'Winter Fashion Campaign',
        description: 'Promote winter clothing collection',
        budget: '5000.00',
        spent: '4200.00',
        revenue: '18000.00',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-02-28'),
        status: 'active',
      },
    ]);

    // Seed alerts
    console.log('🚨 Seeding alerts...');
    await db.insert(schema.alerts).values([
      {
        type: 'inventory',
        title: 'Low Stock Alert',
        message: 'Samsung Galaxy S24 stock is running low (30 units remaining)',
        severity: 'warning',
        isRead: false,
      },
      {
        type: 'sales',
        title: 'Sales Milestone',
        message: 'Congratulations! You have reached $50,000 in total sales this month.',
        severity: 'info',
        isRead: false,
      },
      {
        type: 'review',
        title: 'New 5-Star Review',
        message: 'iPhone 15 Pro received a new 5-star review from John Doe.',
        severity: 'success',
        isRead: true,
      },
    ]);

    // Seed sales metrics
    console.log('📊 Seeding sales metrics...');
    const salesMetricsData = [];
    const baseDate = new Date('2024-01-01');
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      
      salesMetricsData.push({
        date,
        revenue: (Math.random() * 5000 + 1000).toFixed(2),
        orders: Math.floor(Math.random() * 50 + 10),
        customers: Math.floor(Math.random() * 30 + 5),
        averageOrderValue: (Math.random() * 200 + 50).toFixed(2),
      });
    }
    
    await db.insert(schema.salesMetrics).values(salesMetricsData);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}