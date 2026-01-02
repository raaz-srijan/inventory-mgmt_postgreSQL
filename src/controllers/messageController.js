const pool = require('../config/connectDb');

async function sendMessage(req, res) {
    try {
        const { sender_id, receiver_id, content, reply_to_message_id } = req.body;

        if (!sender_id || !receiver_id || !content) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const senderRes = await pool.query(`SELECT role_id, business_id FROM users WHERE id = $1`, [sender_id]);
        const receiverRes = await pool.query(`SELECT role_id, business_id FROM users WHERE id = $1`, [receiver_id]);

        if (!senderRes.rows.length || !receiverRes.rows.length) {
            return res.status(404).json({ success: false, message: "Sender or receiver not found" });
        }

        const sender = senderRes.rows[0];
        const receiver = receiverRes.rows[0];
        const senderLevel = sender.role_id;
        const receiverLevel = receiver.role_id;

        const platformRoles = [1, 2]; 
        if (platformRoles.includes(senderLevel)) {
            if (!(platformRoles.includes(receiverLevel) || receiverLevel === 3)) {
                return res.status(403).json({ success: false, message: "You cannot message this user" });
            }
        }

        if ([3,4].includes(senderLevel)) { 
            if (sender.business_id !== receiver.business_id) {
                return res.status(403).json({ success: false, message: "You can only message users in your business" });
            }

            if (senderLevel === 3 && ![4,5].includes(receiverLevel)) {
                return res.status(403).json({ success: false, message: "Owner can only message managers or staff" });
            }

            if (senderLevel === 4 && ![3,5].includes(receiverLevel)) {
                return res.status(403).json({ success: false, message: "Manager can only message owner or staff" });
            }
        }

        if (senderLevel === 5) {
            if (!reply_to_message_id) {
                return res.status(403).json({ success: false, message: "Staff cannot initiate messages" });
            }

            const msgCheck = await pool.query(
                `SELECT sender_id, receiver_id FROM messages WHERE id = $1 AND receiver_id = $2`,
                [reply_to_message_id, sender_id]
            );

            if (!msgCheck.rows.length) {
                return res.status(403).json({ success: false, message: "Staff can only reply to messages sent to them" });
            }

            const originalSenderRes = await pool.query(
                `SELECT role_id, business_id FROM users WHERE id = $1`,
                [msgCheck.rows[0].sender_id]
            );

            if (![3,4].includes(originalSenderRes.rows[0].role_id) || originalSenderRes.rows[0].business_id !== sender.business_id) {
                return res.status(403).json({ success: false, message: "Staff can only reply to owner or manager in the same business" });
            }
        }

        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, sender_id, receiver_id, content, created_at`,
            [sender_id, receiver_id, content]
        );

        return res.status(201).json({ success: true, message: "Message sent", data: result.rows[0] });

    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}


async function fetchMessages(req, res) {
    try {
        const { user_id } = req.params;

        if (!user_id) return res.status(400).json({ success: false, message: "User ID required" });

        const result = await pool.query(`
            SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at,
                   su.user_name AS sender_name, ru.user_name AS receiver_name
            FROM messages m
            JOIN users su ON su.id = m.sender_id
            JOIN users ru ON ru.id = m.receiver_id
            WHERE m.sender_id = $1 OR m.receiver_id = $1
            ORDER BY m.created_at DESC
        `, [user_id]);

        return res.status(200).json({ success: true, data: result.rows });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = { sendMessage, fetchMessages };
