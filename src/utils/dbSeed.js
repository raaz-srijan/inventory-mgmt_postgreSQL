const pool = require("../config/connectDb");
const bcrypt = require("bcrypt");
const { rolesData, permissionsData, rolePermissions } = require("../constants/data");

async function seedData() {
    try {
        console.log("Starting data seeding...");

        for (const permission of permissionsData) {
            await pool.query(`
                INSERT INTO permissions (name, group_name)
                VALUES ($1, $2)
                ON CONFLICT (name) DO NOTHING
            `, [permission.name, permission.group]);
        }
        console.log("Permissions seeded.");

        for (const role of rolesData) {
            await pool.query(`
                INSERT INTO roles (name)
                VALUES ($1)
                ON CONFLICT (name) DO NOTHING
            `, [role.name]);
        }
        console.log("Roles seeded.");

        for (const roleName in rolePermissions) {
            const roleRes = await pool.query("SELECT id FROM roles WHERE name = $1", [roleName]);
            if (roleRes.rows.length > 0) {
                const roleId = roleRes.rows[0].id;

                for (const permName of rolePermissions[roleName]) {
                    const permRes = await pool.query("SELECT id FROM permissions WHERE name = $1", [permName]);
                    if (permRes.rows.length > 0) {
                        const permId = permRes.rows[0].id;
                        await pool.query(`
                            INSERT INTO role_permissions (role_id, permission_id)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [roleId, permId]);
                    }
                }
            }
        }
        console.log("Role-Permissions relationships seeded.");

        // 4. Seed SuperAdmin User
        const superAdminRoleRes = await pool.query("SELECT id FROM roles WHERE name = 'super_admin'");
        if (superAdminRoleRes.rows.length > 0) {
            const roleId = superAdminRoleRes.rows[0].id;
            const email = "srijan@superadmin@gmail.com";
            const password = await bcrypt.hash("123456", 12);

            await pool.query(`
                INSERT INTO users (name, email, password, role_id, is_verified)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (email) DO NOTHING
            `, ["Super Admin", email, password, roleId, true]);

            console.log("SuperAdmin user seeded.");
        }

        console.log("Seeding completed successfully.");

    } catch (error) {
        console.error("Error during seeding:", error);
    }
}

module.exports = seedData;
