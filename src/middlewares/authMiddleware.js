const jwt = require("jsonwebtoken");
const pool = require("../config/connectDb");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userRes = await pool.query(`
            SELECT u.*, r.name as role_name 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `, [decoded.userId]);

        if (userRes.rows.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = userRes.rows[0];

        // Fetch permissions for the role
        const permRes = await pool.query(`
            SELECT p.name 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = $1
        `, [user.role_id]);

        user.permissions = permRes.rows.map(row => row.name);

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
