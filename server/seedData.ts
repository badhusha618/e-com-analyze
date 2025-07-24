import type { db as dbType } from './db';
import {
  users, vendors, categories, products, customers, orders, orderItems,
  reviews, marketingCampaigns, alerts, salesMetrics
} from '@shared/schema';

import { seedRoles } from "./seedRoles";

export async function seedDatabase(db: typeof dbType) {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Seed roles first (required for user management)
    await seedRoles();

  // Seed Users
  console.log('👥 Seeding users...');
  const userData = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: '$2a$10$rOzJc.3P2wZg0K9V5M2mBu7jL5oCpOFj8Lp9Bb8Hv8uQ3zQ0uP9Ge', // "password123"
      role: 'admin'
    },
    {
      username: 'manager',
      email: 'manager@example.com',
      password: '$2a$10$rOzJc.3P2wZg0K9V5M2mBu7jL5oCpOFj8Lp9Bb8Hv8uQ3zQ0uP9Ge',
      role: 'manager'
    }
  ];
  const insertedUsers = await db.insert(users).values(userData).returning();

  // Seed Vendors
  console.log('🏢 Seeding vendors...');
  const vendorData = [
    { name: 'TechCorp Electronics', email: 'contact@techcorp.com', phone: '+1-555-0101' },
    { name: 'Fashion Forward', email: 'info@fashionforward.com', phone: '+1-555-0102' },
    { name: 'Home & Garden Co', email: 'sales@homeandgarden.com', phone: '+1-555-0103' },
    { name: 'Sports Central', email: 'team@sportscentral.com', phone: '+1-555-0104' }
  ];
  const insertedVendors = await db.insert(vendors).values(vendorData).returning();

  // Seed Categories
  console.log('📂 Seeding categories...');
  const categoryData = [
    { name: 'Electronics', description: 'Electronic devices and gadgets' },
    { name: 'Clothing', description: 'Fashion and apparel' },
    { name: 'Home & Garden', description: 'Home improvement and gardening supplies' },
    { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
    { name: 'Books', description: 'Books and educational materials' }
  ];
  const insertedCategories = await db.insert(categories).values(categoryData).returning();

  // Seed Products
  console.log('📦 Seeding products...');
  const productData = [
    {
      name: 'iPhone 15 Pro',
      sku: 'APL-IPH15-PRO-256',
      price: '999.99',
      costPrice: '699.99',
      inventory: 50,
      categoryId: insertedCategories[0].id,
      vendorId: insertedVendors[0].id
    },
    {
      name: 'Samsung Galaxy Watch',
      sku: 'SAM-GW-6-44MM',
      price: '299.99',
      costPrice: '199.99',
      inventory: 75,
      categoryId: insertedCategories[0].id,
      vendorId: insertedVendors[0].id
    },
    {
      name: 'Designer Jeans',
      sku: 'FF-JEANS-SLIM-32',
      price: '89.99',
      costPrice: '39.99',
      inventory: 120,
      categoryId: insertedCategories[1].id,
      vendorId: insertedVendors[1].id
    },
    {
      name: 'Garden Tool Set',
      sku: 'HG-TOOLS-SET-PRO',
      price: '45.99',
      costPrice: '24.99',
      inventory: 35,
      categoryId: insertedCategories[2].id,
      vendorId: insertedVendors[2].id
    },
    {
      name: 'Running Shoes',
      sku: 'SC-SHOES-RUN-10',
      price: '129.99',
      costPrice: '79.99',
      inventory: 85,
      categoryId: insertedCategories[3].id,
      vendorId: insertedVendors[3].id
    }
  ];
  const insertedProducts = await db.insert(products).values(productData).returning();

  // Seed Customers
  console.log('👤 Seeding customers...');
  const customerData = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-1001'
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-1002'
    },
    {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@email.com',
      phone: '+1-555-1003'
    }
  ];
  const insertedCustomers = await db.insert(customers).values(customerData).returning();

  // Seed Orders
  console.log('📋 Seeding orders...');
  const orderData = [
    {
      customerId: insertedCustomers[0].id,
      totalAmount: '1299.98',
      status: 'completed',
      orderDate: new Date('2024-01-15')
    },
    {
      customerId: insertedCustomers[1].id,
      totalAmount: '89.99',
      status: 'shipped',
      orderDate: new Date('2024-01-16')
    },
    {
      customerId: insertedCustomers[2].id,
      totalAmount: '429.98',
      status: 'processing',
      orderDate: new Date('2024-01-17')
    }
  ];
  const insertedOrders = await db.insert(orders).values(orderData).returning();

  // Seed Order Items
  console.log('🛒 Seeding order items...');
  const orderItemData = [
    {
      orderId: insertedOrders[0].id,
      productId: insertedProducts[0].id,
      quantity: 1,
      unitPrice: '999.99'
    },
    {
      orderId: insertedOrders[0].id,
      productId: insertedProducts[1].id,
      quantity: 1,
      unitPrice: '299.99'
    },
    {
      orderId: insertedOrders[1].id,
      productId: insertedProducts[2].id,
      quantity: 1,
      unitPrice: '89.99'
    },
    {
      orderId: insertedOrders[2].id,
      productId: insertedProducts[1].id,
      quantity: 1,
      unitPrice: '299.99'
    },
    {
      orderId: insertedOrders[2].id,
      productId: insertedProducts[4].id,
      quantity: 1,
      unitPrice: '129.99'
    }
  ];
  await db.insert(orderItems).values(orderItemData);

  // Seed Reviews
  console.log('⭐ Seeding reviews...');
  const reviewData = [
    {
      productId: insertedProducts[0].id,
      customerId: insertedCustomers[0].id,
      rating: 5,
      content: 'Excellent phone! Very fast and great camera quality.',
      reviewDate: new Date('2024-01-20')
    },
    {
      productId: insertedProducts[1].id,
      customerId: insertedCustomers[1].id,
      rating: 4,
      content: 'Good smartwatch, battery life could be better.',
      reviewDate: new Date('2024-01-21')
    },
    {
      productId: insertedProducts[2].id,
      customerId: insertedCustomers[2].id,
      rating: 3,
      content: 'Jeans are okay, fit is not perfect.',
      reviewDate: new Date('2024-01-22')
    }
  ];
  await db.insert(reviews).values(reviewData);

  // Seed Marketing Campaigns
  console.log('📢 Seeding marketing campaigns...');
  const campaignData = [
    {
      name: 'January Electronics Sale',
      channel: 'email',
      budget: '5000.00',
      spent: '3500.00',
      impressions: 50000,
      clicks: 2500,
      conversions: 125,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    },
    {
      name: 'Winter Fashion Campaign',
      channel: 'social',
      budget: '3000.00',
      spent: '2800.00',
      impressions: 75000,
      clicks: 1800,
      conversions: 90,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15')
    }
  ];
  await db.insert(marketingCampaigns).values(campaignData);

  // Seed Alerts
  console.log('🚨 Seeding alerts...');
  const alertData = [
    {
      type: 'inventory',
      severity: 'high',
      title: 'Low Stock Alert',
      message: 'Garden Tool Set is running low on inventory (5 units remaining)',
      isRead: false,
      metadata: { productId: insertedProducts[3].id, currentStock: 5 }
    },
    {
      type: 'performance',
      severity: 'medium',
      title: 'Sales Target Warning',
      message: 'Monthly sales target is behind by 15%',
      isRead: false,
      metadata: { targetDeficit: 15 }
    },
    {
      type: 'review',
      severity: 'low',
      title: 'New Customer Review',
      message: 'New 5-star review received for iPhone 15 Pro',
      isRead: true,
      metadata: { productId: insertedProducts[0].id, rating: 5 }
    }
  ];
  await db.insert(alerts).values(alertData);

  // Seed Sales Metrics
  console.log('📊 Seeding sales metrics...');
  const metricsData = [
    {
      date: new Date('2024-01-15'),
      totalSales: '12999.85',
      totalOrders: 45,
      averageOrderValue: '288.89',
      returnRate: '0.0250'
    },
    {
      date: new Date('2024-01-16'),
      totalSales: '8750.23',
      totalOrders: 32,
      averageOrderValue: '273.44',
      returnRate: '0.0300'
    },
    {
      date: new Date('2024-01-17'),
      totalSales: '15432.67',
      totalOrders: 56,
      averageOrderValue: '275.58',
      returnRate: '0.0200'
    }
  ];
  await db.insert(salesMetrics).values(metricsData);

  console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}