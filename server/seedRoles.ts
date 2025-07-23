import { db } from "./db";
import { roles, userRoles, users, PERMISSIONS } from "../shared/schema";
import { eq, and } from "drizzle-orm";

export async function seedRoles() {
  console.log("🔐 Seeding roles and permissions...");
  
  try {
    // Create default roles with permissions
    const defaultRoles = [
      {
        name: "SUPER_ADMIN",
        description: "Full system access with all permissions",
        permissions: Object.values(PERMISSIONS),
      },
      {
        name: "USER_ADMIN", 
        description: "User management and role assignment permissions",
        permissions: [
          PERMISSIONS.USER_CREATE,
          PERMISSIONS.USER_READ,
          PERMISSIONS.USER_UPDATE,
          PERMISSIONS.USER_ROLES_UPDATE,
          PERMISSIONS.ROLE_READ,
          PERMISSIONS.DASHBOARD_READ,
          PERMISSIONS.ANALYTICS_READ,
        ],
      },
      {
        name: "READER",
        description: "Read-only access to dashboard and analytics",
        permissions: [
          PERMISSIONS.DASHBOARD_READ,
          PERMISSIONS.ANALYTICS_READ,
        ],
      },
      {
        name: "EXTERNAL_USER",
        description: "Limited access for external/OAuth users",
        permissions: [
          PERMISSIONS.DASHBOARD_READ,
        ],
      },
    ];

    // Insert roles
    for (const roleData of defaultRoles) {
      const [existingRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleData.name))
        .limit(1);

      if (!existingRole) {
        await db.insert(roles).values({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        });
        console.log(`  ✅ Created role: ${roleData.name}`);
      } else {
        console.log(`  ⚠️  Role already exists: ${roleData.name}`);
      }
    }

    // Assign SUPER_ADMIN role to the first admin user (if exists)
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"))
      .limit(1);

    if (adminUser) {
      const [superAdminRole] = await db
        .select()
        .from(roles)
        .where({ name: "SUPER_ADMIN" } as any)
        .limit(1);

      if (superAdminRole) {
        const [existingAssignment] = await db
          .select()
          .from(userRoles)
          .where(and(
            eq(userRoles.userId, adminUser.id),
            eq(userRoles.roleId, superAdminRole.id)
          ))
          .limit(1);

        if (!existingAssignment) {
          await db.insert(userRoles).values({
            userId: adminUser.id,
            roleId: superAdminRole.id,
            assignedBy: adminUser.id, // Self-assigned
          });
          console.log(`  ✅ Assigned SUPER_ADMIN role to admin user`);
        }
      }
    }

    console.log("✅ Role seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
    throw error;
  }
}