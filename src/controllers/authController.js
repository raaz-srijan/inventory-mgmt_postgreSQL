const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pool = require("../config/connectDb");
const { generateJWT } = require("../utils/generateToken");
const { sendStaffWelcomeEmail, sendPasswordResetEmail } = require("../utils/sendEmail");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const result = await pool.query(
            `SELECT u.*, r.name as role_name 
             FROM users u
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

        const permRes = await pool.query(`
            SELECT p.name 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = $1
        `, [user.role_id]);

        const permissions = permRes.rows.map(row => row.name);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_name,
                business_id: user.business_id,
                permissions
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        if (!business_id) {
            return res.status(400).json({ success: false, message: "User is not associated with a business" });
        }

        const countRes = await pool.query("SELECT COUNT(*) FROM users WHERE business_id = $1", [business_id]);
        const total = parseInt(countRes.rows[0].count);

        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.phone, u.role_id, r.name as role_name, u.created_at 
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.business_id = $1
             ORDER BY u.created_at DESC
             LIMIT $2 OFFSET $3`,
            [business_id, limit, offset]
        );

        res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get staff error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, phone } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name), 
                 email = COALESCE($2, email), 
                 phone = COALESCE($3, phone) 
             WHERE id = $4 
             RETURNING id, name, email, phone, business_id`,
            [name, email, phone, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, role_id } = req.body;
        const business_id = req.user.business_id;

        // Verify the staff belongs to the same business
        const checkRes = await pool.query("SELECT * FROM users WHERE id = $1 AND business_id = $2", [id, business_id]);
        if (checkRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Staff member not found in your business" });
        }

        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name), 
                 phone = COALESCE($2, phone), 
                 role_id = COALESCE($3, role_id) 
             WHERE id = $4 AND business_id = $5
             RETURNING id, name, email, phone, role_id`,
            [name, phone, role_id, id, business_id]
        );

        res.status(200).json({
            success: true,
            message: "Staff updated successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Update staff error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const business_id = req.user.business_id;

        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 AND business_id = $2 RETURNING id",
            [id, business_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        res.status(200).json({ success: true, message: "Staff member removed successfully" });
    } catch (error) {
        console.error("Delete staff error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const userRes = await pool.query("SELECT id, name, email FROM users WHERE email = $1", [email]);
        if (userRes.rows.length === 0) {
            // For security, don't reveal if email exists
            return res.status(200).json({ success: true, message: "If that email exists in our system, we've sent a reset link." });
        }

        const user = userRes.rows[0];
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        await pool.query(
            "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
            [token, expires, user.id]
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
        await sendPasswordResetEmail(user, resetLink);

        res.status(200).json({ success: true, message: "Reset link sent successfully" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, token, password } = req.body;

        if (!email || !token || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const userRes = await pool.query(
            "SELECT id FROM users WHERE email = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()",
            [email, token]
        );

        if (userRes.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const user = userRes.rows[0];
        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.query(
            "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
            [hashedPassword, user.id]
        );

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { login, registerStaff, getStaff, updateProfile, updateStaff, deleteStaff, forgotPassword, resetPassword };
