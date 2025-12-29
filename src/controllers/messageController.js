const pool = require("../config/connectDb");

const sendMessage = async (req, res) => {
    try {
        const { receiver_id, content } = req.body;
        const sender_id = req.user.id;
        const business_id = req.user.business_id;

        const result = await pool.query(
            "INSERT INTO messages (sender_id, receiver_id, content, business_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [sender_id, receiver_id, content, business_id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT m.*, u_s.name as sender_name, u_r.name as receiver_name 
             FROM messages m 
             JOIN users u_s ON m.sender_id = u_s.id 
             JOIN users u_r ON m.receiver_id = u_r.id 
             WHERE m.sender_id = $1 OR m.receiver_id = $1
             ORDER BY m.created_at DESC`,
            [userId]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { sendMessage, getMessages };
