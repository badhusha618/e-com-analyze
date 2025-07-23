# Automatic Database Migration System

This project includes an automatic database migration system similar to Flyway that handles different environments automatically.

## How It Works

The system automatically runs when you start the application and behaves differently based on your environment:

### Development Environment (Local)
**Command:** `npm run dev`
**Behavior:**
- 🗑️ **Drops all existing tables** (fresh start every time)
- 📋 **Creates all tables** from schema
- 🌱 **Seeds database** with sample data
- Perfect for local development with clean data each run

### Staging Environment
**Command:** `NODE_ENV=staging npm run dev`
**Behavior:**
- 📈 **Runs migrations** only (preserves existing data)
- No dropping of tables
- No seeding of data
- Safe for staging environment

### Production Environment
**Command:** `NODE_ENV=production npm start`
**Behavior:**
- 📈 **Runs migrations** only (safest approach)
- No dropping of tables
- No seeding of data
- Maximum safety for production

## Configuration

The system uses environment-based configuration in `server/config.ts`:

```typescript
export const config = {
  database: {
    development: {
      dropAndRecreate: true,   // Fresh database each run
      seedData: true,          // Load sample data
      autoMigrate: false
    },
    staging: {
      dropAndRecreate: false,  // Preserve data
      seedData: false,         // No sample data
      autoMigrate: true        // Run migrations
    },
    production: {
      dropAndRecreate: false,  // Preserve data
      seedData: false,         // No sample data
      autoMigrate: true        // Run migrations
    }
  }
}
```

## Manual Commands

If you need to run database operations manually:

```bash
# Push schema to database (creates/updates tables)
npx drizzle-kit push

# Generate migration files
npx drizzle-kit generate

# Run existing migrations
npx drizzle-kit migrate
```

## Sample Data

In development mode, the system automatically seeds the database with:
- 👥 Sample users (admin, manager)
- 🏢 Vendors (TechCorp, Fashion Forward, etc.)
- 📂 Product categories
- 📦 Sample products with inventory
- 👤 Sample customers
- 📋 Sample orders and order items
- ⭐ Product reviews
- 📢 Marketing campaigns
- 🚨 System alerts
- 📊 Sales metrics

## Database Schema

The database includes comprehensive e-commerce tables:
- `users` - System users
- `vendors` - Product suppliers
- `categories` - Product categorization
- `products` - Product catalog
- `customers` - Customer information
- `orders` & `order_items` - Order management
- `reviews` - Product reviews
- `marketing_campaigns` - Campaign tracking
- `alerts` - System notifications
- `sales_metrics` - Performance analytics

## Environment Variables

Ensure you have the following environment variables set:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment mode (development, staging, production)

The system will automatically configure the appropriate migration strategy based on your environment.