const pool = require("../config/connectDb");

const createNotice = async (req, res) => {
    try {
        const { title, content, type } = req.body;
        const business_id = type === 'business' ? req.user.business_id : null;

        const result = await pool.query(
            "INSERT INTO notices (title, content, type, business_id, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, content, type || 'global', business_id, req.user.id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getNotices = async (req, res) => {
    try {
        // Global notices + business notices for current user
        const result = await pool.query(
            "SELECT n.*, u.name as creator_name FROM notices n JOIN users u ON n.created_by = u.id WHERE n.type = 'global' OR n.business_id = $1",
            [req.user.business_id]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createNotice, getNotices };
