// Environment-based configuration
export const config = {
  // Database configuration based on environment
  database: {
    // In development: drop and recreate database each run
    development: {
      dropAndRecreate: true,
      seedData: true,
      autoMigrate: false
    },
    // In staging: run migrations only
    staging: {
      dropAndRecreate: false,
      seedData: false,
      autoMigrate: true
    },
    // In production: run migrations only (safest)
    production: {
      dropAndRecreate: false,
      seedData: false,
      autoMigrate: true
    }
  },

  // Get current environment configuration
  getCurrentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return this.database[env as keyof typeof this.database] || this.database.development;
  }
};