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

    await pool.query("COMMIT");
    console.log("Seeding completed successfully");

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Seeding failed:", error);
  }
}


module.exports = seedData;
