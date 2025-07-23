import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';
import { config } from './config';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Database migration utility
export class DatabaseMigrator {
  private pool: Pool;
  private db: ReturnType<typeof drizzle>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.db = drizzle({ client: this.pool, schema });
  }

  // Drop all tables and recreate them (for local development)
  async recreateDatabase() {
    console.log('🗑️  Dropping all tables...');
    
    try {
      // Drop all tables in the correct order (considering foreign key constraints)
      await this.db.execute(sql`DROP TABLE IF EXISTS sales_metrics CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS alerts CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS marketing_campaigns CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS reviews CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS order_items CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS orders CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS customers CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS products CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS categories CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS vendors CASCADE`);
      await this.db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
      
      console.log('✅ All tables dropped successfully');
    } catch (error) {
      console.log('ℹ️  Tables already dropped or don\'t exist');
    }

    // Recreate all tables
    console.log('📋 Creating all tables...');
    await this.createTables();
    
    // Seed with sample data
    console.log('🌱 Seeding database with sample data...');
    await this.seedDatabase();
    
    console.log('🎉 Database recreation completed!');
  }

  // Create tables using Drizzle push (for staging/production)
  async createTables() {
    try {
      // Use shell command to run drizzle push
      await this.runShellCommand('npx drizzle-kit push');
      console.log('✅ Tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  // Helper method to run shell commands
  private async runShellCommand(command: string): Promise<void> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout, stderr } = await execAsync(command);
    if (stderr && !stderr.includes('warning')) {
      throw new Error(stderr);
    }
    console.log(stdout);
  }

  // Migrate using drizzle migrations (for staging/production)
  async runMigrations() {
    console.log('🔄 Running database migrations...');
    try {
      await migrate(this.db, { migrationsFolder: './migrations' });
      console.log('✅ Migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Seed database with sample data
  async seedDatabase() {
    try {
      // Import seed data function
      const { seedDatabase } = await import('./seedData.js');
      await seedDatabase(this.db as any);
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

// Environment-specific migration logic
export async function runDatabaseSetup() {
  const env = process.env.NODE_ENV || 'development';
  const databaseUrl = process.env.DATABASE_URL;
  const dbConfig = config.getCurrentConfig();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const migrator = new DatabaseMigrator(databaseUrl);

  try {
    console.log(`🔧 Running in ${env.toUpperCase()} mode...`);
    
    if (dbConfig.dropAndRecreate) {
      // Local development: Drop and recreate everything
      console.log('💥 Recreating database (drop & create)...');
      await migrator.recreateDatabase();
    } else if (dbConfig.autoMigrate) {
      // Staging/Production: Run migrations only
      console.log('📈 Running database migrations...');
      await migrator.runMigrations();
      
      if (dbConfig.seedData) {
        console.log('🌱 Seeding database...');
        await migrator.seedDatabase();
      }
    } else {
      // Just create tables
      console.log('📋 Creating database tables...');
      await migrator.createTables();
    }
  } finally {
    await migrator.close();
  }
}