const pool = require("../config/connectDb");
const { sendTicketUpdateEmail } = require("../utils/sendEmail");

const createTicket = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const sender_id = req.user.id;
        const business_id = req.user.business_id;

        const result = await pool.query(
            `INSERT INTO tickets (title, description, priority, sender_id, business_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [title, description, priority || 'medium', sender_id, business_id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Create ticket error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTickets = async (req, res) => {
    try {
        let query = "SELECT t.*, u.name as sender_name, b.name as business_name FROM tickets t JOIN users u ON t.sender_id = u.id LEFT JOIN businesses b ON t.business_id = b.id";
        let params = [];

        if (req.user.business_id) {
            query += " WHERE t.business_id = $1";
            params.push(req.user.business_id);
        } else if (req.user.role_name !== 'admin' && req.user.role_name !== 'super_admin') {
            query += " WHERE t.sender_id = $1";
            params.push(req.user.id);
        }

        const result = await pool.query(query, params);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get tickets error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assigned_to } = req.body;

        const result = await pool.query(
            "UPDATE tickets SET status = $1, assigned_to = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
            [status, assigned_to || req.user.id, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "Ticket not found" });

        const ticket = result.rows[0];

        const senderRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [ticket.sender_id]);
        if (senderRes.rows.length > 0) {
            await sendTicketUpdateEmail(senderRes.rows[0], ticket, status);
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        console.error("Update ticket status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createTicket, getTickets, updateTicketStatus };
