import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

export async function seedRoles(db: NodePgDatabase<typeof schema>) {
  console.log('🔐 Seeding roles and permissions...');

  try {
    // Insert roles with comprehensive permissions
    await db.insert(schema.roles).values([
      {
        name: 'SUPER_ADMIN',
        description: 'Full system access with all permissions',
        permissions: [
          'users.create',
          'users.read',
          'users.update', 
          'users.delete',
          'users.manage_roles',
          'system.configure',
          'audit.read',
          'audit.export'
        ],
      },
      {
        name: 'USER_ADMIN',
        description: 'User management and basic system access',
        permissions: [
          'users.create',
          'users.read',
          'users.update',
          'users.manage_roles',
          'dashboard.read'
        ],
      },
      {
        name: 'READER',
        description: 'Read-only access to dashboards and reports',
        permissions: [
          'dashboard.read',
          'reports.read',
          'products.read',
          'customers.read'
        ],
      },
      {
        name: 'EXTERNAL_USER',
        description: 'Limited access for external OAuth users',
        permissions: [
          'dashboard.read',
          'profile.update'
        ],
      },
    ]);

    const roles = await db.select().from(schema.roles);
    
    for (const role of roles) {
      console.log(`  ✅ Created role: ${role.name}`);
    }

    console.log('✅ Role seeding completed successfully!');
  } catch (error) {
    console.error('❌ Role seeding failed:', error);
    throw error;
  }
}