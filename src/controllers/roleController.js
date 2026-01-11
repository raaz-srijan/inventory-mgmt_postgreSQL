const pool = require("../config/connectDb");

const getRoles = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, array_agg(p.name) as permissions
            FROM roles r
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.id
            GROUP BY r.id
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get roles error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateRolePermissions = async (req, res) => {
    try {
        const { roleId, permissions } = req.body;

        await pool.query("DELETE FROM role_permissions WHERE role_id = $1", [roleId]);

        for (const permName of permissions) {
            const permRes = await pool.query("SELECT id FROM permissions WHERE name = $1", [permName]);
            if (permRes.rows.length > 0) {
                await pool.query(
                    "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    [roleId, permRes.rows[0].id]
                );
            }
        }

        res.status(200).json({ success: true, message: "Role permissions updated" });
    } catch (error) {
        console.error("Update role permissions error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPermissions = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM permissions");
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const createRole = async (req, res) => {
    try {
        const { name, level } = req.body;
        if (!name || !level) return res.status(400).json({ message: "Name and level are required" });

        const result = await pool.query(
            "INSERT INTO roles (name, level) VALUES ($1, $2) RETURNING *",
            [name, level]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Create role error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createPermission = async (req, res) => {
    try {
        const { name, group_name } = req.body;
        if (!name || !group_name) return res.status(400).json({ message: "Name and group_name are required" });

        const result = await pool.query(
            "INSERT INTO permissions (name, group_name) VALUES ($1, $2) RETURNING *",
            [name, group_name]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Create permission error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getRoles, updateRolePermissions, getPermissions, createRole, createPermission };
