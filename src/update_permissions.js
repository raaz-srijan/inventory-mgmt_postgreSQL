const pool = require('./config/connectDb');
const { rolesData, permissionsData, rolePermissions } = require('./constants/data');

const updatePermissions = async () => {
    try {
        console.log("Updating permissions...");

        for (const role of rolesData) {
            const res = await pool.query("SELECT id FROM roles WHERE name = $1", [role.name]);
            if (res.rows.length === 0) {
                await pool.query("INSERT INTO roles (name, level) VALUES ($1, $2)", [role.name, role.level]);
                console.log(`Role ${role.name} created.`);
            }
        }

        for (const perm of permissionsData) {
            const res = await pool.query("SELECT id FROM permissions WHERE name = $1", [perm.name]);
            if (res.rows.length === 0) {
                await pool.query("INSERT INTO permissions (name, group_name) VALUES ($1, $2)", [perm.name, perm.group]);
                console.log(`Permission ${perm.name} created.`);
            }
        }

        for (const [roleName, perms] of Object.entries(rolePermissions)) {
            const roleRes = await pool.query("SELECT id FROM roles WHERE name = $1", [roleName]);
            if (roleRes.rows.length === 0) continue;
            const roleId = roleRes.rows[0].id;

            const currentRolePerms = await pool.query(`
                SELECT rp.permission_id, p.name 
                FROM role_permissions rp 
                JOIN permissions p ON rp.permission_id = p.id 
                WHERE rp.role_id = $1
            `, [roleId]);

            for (const row of currentRolePerms.rows) {
                if (!perms.includes(row.name)) {
                    await pool.query("DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2", [roleId, row.permission_id]);
                    console.log(`Revoked ${row.name} from ${roleName}`);
                }
            }

            for (const permName of perms) {
                const permRes = await pool.query("SELECT id FROM permissions WHERE name = $1", [permName]);
                if (permRes.rows.length === 0) continue;
                const permId = permRes.rows[0].id;

                const check = await pool.query("SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2", [roleId, permId]);
                if (check.rows.length === 0) {
                    await pool.query("INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)", [roleId, permId]);
                    console.log(`Assigned ${permName} to ${roleName}`);
                }
            }
        }

        console.log("Permissions updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating permissions:", error);
        process.exit(1);
    }
};

updatePermissions();
