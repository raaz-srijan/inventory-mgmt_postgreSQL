const pool = require("../config/connectDb");

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;
    let business_id = req.user.business_id;

    if (!business_id) {
      const receiverRes = await pool.query(
        "SELECT business_id FROM users WHERE id = $1",
        [receiver_id]
      );
      if (receiverRes.rows.length > 0) {
        business_id = receiverRes.rows[0].business_id;
      }
    }

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


const getChatUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    let query = "";
    let params = [];

    if (["super_admin", "admin"].includes(currentUser.role_name)) {
      query = `
                SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.business_id, b.name as business_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN businesses b ON u.business_id = b.id
                WHERE r.name IN ('super_admin', 'admin', 'owner')
                AND u.id != $1
                ORDER BY r.name ASC, u.name ASC
            `;
      params = [currentUser.id];
    } else if (currentUser.role_name === "owner") {
      query = `
                SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.business_id, b.name as business_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN businesses b ON u.business_id = b.id
                WHERE (u.business_id = $1 AND u.business_id IS NOT NULL)
                   OR r.name IN ('super_admin', 'admin')
                AND u.id != $2
                ORDER BY r.name ASC, u.name ASC
            `;
      params = [currentUser.business_id, currentUser.id];
    } else {
      query = `
                SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.business_id, b.name as business_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN businesses b ON u.business_id = b.id
                WHERE (u.business_id = $1 OR u.id = (SELECT owner_id FROM businesses WHERE id = $1))
                AND u.id != $2
                ORDER BY r.name ASC, u.name ASC
            `;
      params = [currentUser.business_id, currentUser.id];
    }

    const result = await pool.query(query, params);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get chat users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getMessages, getChatUsers };
