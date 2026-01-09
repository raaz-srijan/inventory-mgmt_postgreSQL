const pool = require("../config/connectDb");
const bcrypt = require("bcrypt");
const { rolesData, permissionsData, rolePermissions } = require("../constants/data");

async function seedData() {
  try {
    await pool.query("BEGIN");

    for (const permission of permissionsData) {
      await pool.query(`
        INSERT INTO permissions (name, group_name)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
      `, [permission.name, permission.group]);
    }

    for (const role of rolesData) {
      await pool.query(`
        INSERT INTO roles (name, level)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
      `, [role.name, role.level]);
    }

    for (const roleName in rolePermissions) {
      const roleRes = await pool.query(
        "SELECT id FROM roles WHERE name = $1",
        [roleName]
      );

      if (!roleRes.rows.length) continue;

      const roleId = roleRes.rows[0].id;



      for (const permName of rolePermissions[roleName]) {
        const permRes = await pool.query(
          "SELECT id FROM permissions WHERE name = $1",
          [permName]
        );

        if (!permRes.rows.length) continue;

        await pool.query(`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [roleId, permRes.rows[0].id]);
      }
    }

    // Seed Users and Business
    console.log("Seeding users...");
    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Create Super Admin
    const superAdminRole = await pool.query("SELECT id FROM roles WHERE name = 'super_admin'");
    if (superAdminRole.rows.length) {
      await pool.query(`
        INSERT INTO users (name, email, password, role_id, is_verified)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
      `, ["Super Admin", "super_admin@test.com", passwordHash, superAdminRole.rows[0].id, true]);
    }

    // 2. Create Admin
    const adminRole = await pool.query("SELECT id FROM roles WHERE name = 'admin'");
    if (adminRole.rows.length) {
      await pool.query(`
        INSERT INTO users (name, email, password, role_id, is_verified)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
      `, ["Admin", "admin@test.com", passwordHash, adminRole.rows[0].id, true]);
    }

    // 3. Create Owner
    const ownerRole = await pool.query("SELECT id FROM roles WHERE name = 'owner'");
    let ownerId = null;
    if (ownerRole.rows.length) {
      const ownerRes = await pool.query(`
        INSERT INTO users (name, email, password, role_id, is_verified)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING id
      `, ["Owner", "owner@test.com", passwordHash, ownerRole.rows[0].id, true]);

      // If INSERT ignored (conflict), fetch the ID
      if (ownerRes.rows.length) {
        ownerId = ownerRes.rows[0].id;
      } else {
        const existingOwner = await pool.query("SELECT id FROM users WHERE email = $1", ["owner@test.com"]);
        ownerId = existingOwner.rows[0].id;
      }
    }

    // 4. Create Business (linked to Owner)
    let businessId = null;
    if (ownerId) {
      const existingBusiness = await pool.query("SELECT id FROM businesses WHERE license_img = $1", ["license_img_test.jpg"]);

      if (existingBusiness.rows.length) {
        businessId = existingBusiness.rows[0].id;
      } else {
        const businessRes = await pool.query(`
          INSERT INTO businesses (name, license_no, license_img, address, citizenship_no, citizenship_front, citizenship_back, is_verified, owner_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, ["Test Business", "TB-123456", "license_img_test.jpg", "123 Test St", "CIT-001", "cit_front.jpg", "cit_back.jpg", true, ownerId]);
        businessId = businessRes.rows[0].id;
      }

      // Update Owner with business_id
      await pool.query("UPDATE users SET business_id = $1 WHERE id = $2", [businessId, ownerId]);
    }

    // 5. Create Manager (linked to Business)
    const managerRole = await pool.query("SELECT id FROM roles WHERE name = 'manager'");
    if (managerRole.rows.length && businessId) {
      await pool.query(`
        INSERT INTO users (name, email, password, role_id, business_id, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, ["Manager", "manager@test.com", passwordHash, managerRole.rows[0].id, businessId, true]);
    }

    // 6. Create Staff (linked to Business)
    const staffRole = await pool.query("SELECT id FROM roles WHERE name = 'staff'");
    if (staffRole.rows.length && businessId) {
      await pool.query(`
        INSERT INTO users (name, email, password, role_id, business_id, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, ["Staff", "staff@test.com", passwordHash, staffRole.rows[0].id, businessId, true]);
    }

    await pool.query("COMMIT");
    console.log("Seeding completed successfully");

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Seeding failed:", error);
  }
}


module.exports = seedData;
