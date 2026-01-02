const pool = require("../config/connectDb");

async function createRole(req, res) {
    try {
        const { name } = req.body;

        if (!name)
            return res.status(400).json({ success: false, message: "Role name is required" });

        const exists = await pool.query(
            "SELECT id FROM roles WHERE name = $1",
            [name]
        );

        if (exists.rows.length)
            return res.status(400).json({ success: false, message: "Role already exists" });

        const result = await pool.query(
            "INSERT INTO roles (name) VALUES ($1) RETURNING *",
            [name]
        );

        return res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function createPermission(req, res) {
    try {
        const { name, group_name } = req.body;

        if (!name)
            return res.status(400).json({ success: false, message: "Permission name is required" });

        const exists = await pool.query(
            "SELECT id FROM permissions WHERE name = $1",
            [name]
        );

        if (exists.rows.length)
            return res.status(400).json({ success: false, message: "Permission already exists" });

        const result = await pool.query(
            "INSERT INTO permissions (name, group_name) VALUES ($1, $2) RETURNING *",
            [name, group_name]
        );

        return res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function getRoles(req, res) {
    try {
        const result = await pool.query(`
            SELECT 
                r.id,
                r.name,
                COALESCE(
                    array_agg(p.name) FILTER (WHERE p.name IS NOT NULL),
                    '{}'
                ) AS permissions
            FROM roles r
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.id
            GROUP BY r.id
            ORDER BY r.id
        `);

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function getPermissions(req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM permissions ORDER BY id"
        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function updateRole(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name)
            return res.status(400).json({ success: false, message: "Role name is required" });

        const result = await pool.query(
            "UPDATE roles SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );

        if (!result.rows.length)
            return res.status(404).json({ success: false, message: "Role not found" });

        return res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function updateRolePermissions(req, res) {
    const client = await pool.connect();

    try {
        const { roleId, permissions } = req.body;

        if (!roleId || !Array.isArray(permissions))
            return res.status(400).json({
                success: false,
                message: "Invalid input"
            });

        await client.query("BEGIN");

        await client.query(
            "DELETE FROM role_permissions WHERE role_id = $1",
            [roleId]
        );

        for (const permName of permissions) {
            const permRes = await client.query(
                "SELECT id FROM permissions WHERE name = $1",
                [permName]
            );

            if (permRes.rows.length) {
                await client.query(
                    `INSERT INTO role_permissions (role_id, permission_id)
                     VALUES ($1, $2)
                     ON CONFLICT DO NOTHING`,
                    [roleId, permRes.rows[0].id]
                );
            }
        }

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Role permissions updated successfully"
        });

    } catch (error) {
        await client.query("ROLLBACK");
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    } finally {
        client.release();
    }
}

async function deleteRole(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM roles WHERE id = $1 RETURNING *",
            [id]
        );

        if (!result.rows.length)
            return res.status(404).json({ success: false, message: "Role not found" });

        return res.status(200).json({
            success: true,
            message: "Role deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function deletePermission(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM permissions WHERE id = $1 RETURNING *",
            [id]
        );

        if (!result.rows.length)
            return res.status(404).json({ success: false, message: "Permission not found" });

        return res.status(200).json({
            success: true,
            message: "Permission deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}


module.exports = {
    createRole,
    createPermission,
    getRoles,
    getPermissions,
    updateRole,
    updateRolePermissions,
    deleteRole,
    deletePermission
};
