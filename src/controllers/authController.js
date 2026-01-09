const bcrypt = require("bcrypt");
const pool = require("../config/connectDb");
const { generateJWT } = require("../utils/generateToken");
const { sendStaffWelcomeEmail } = require("../utils/sendEmail");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const result = await pool.query(
            `SELECT u.*, r.name as role_name 
             FROM users up.-
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateJWT({ userId: user.id });

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_name,
                business_id: user.business_id
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const registerStaff = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        const business_id = req.user.business_id;

        if (!business_id) {
            return res.status(403).json({ message: "Only business owners can register staff" });
        }

        const roleResult = await pool.query("SELECT id FROM roles WHERE name = $1", [role]);
        if (roleResult.rows.length === 0) return res.status(400).json({ message: "Invalid role" });
        const roleId = roleResult.rows[0].id;

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, phone, business_id, role_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, role_id`,
            [name, email, hashedPassword, phone, business_id, roleId]
        );

        await sendStaffWelcomeEmail(result.rows[0], password, role);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Register staff error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStaff = async (req, res) => {
    try {
        const business_id = req.user.business_id;

        if (!business_id) {
            return res.status(400).json({ success: false, message: "User is not associated with a business" });
        }

        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.phone, u.role_id, r.name as role_name, u.created_at 
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.business_id = $1
             ORDER BY u.created_at DESC`,
            [business_id]
        );

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get staff error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { login, registerStaff, getStaff };
