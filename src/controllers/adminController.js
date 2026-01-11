const bcrypt = require("bcrypt");
const pool = require("../config/connectDb");

const getAdmins = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.name, u.email, u.phone, u.created_at, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'admin'
            ORDER BY u.created_at DESC
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get admins error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'admin'");
        if (roleRes.rows.length === 0) return res.status(500).json({ message: "Admin role not found" });
        const roleId = roleRes.rows[0].id;

        const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email",
            [name, email, hashedPassword, roleId]
        );


        res.status(201).json({ success: true, data: result.rows[0] });

    } catch (error) {
        console.error("Create admin error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        res.status(200).json({ success: true, message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Delete admin error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAdmins, createAdmin, deleteAdmin };
