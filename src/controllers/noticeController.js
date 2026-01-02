const pool = require('../config/connectDb');

async function postNotice(req, res) {
    try {
        const { content, business_id } = req.body;
        const attachments = req.files ? req.files.map(f => f.path) : [];
        const userId = req.user.id;

        const result = await pool.query(`
            INSERT INTO notices (user_id, business_id, content, attachments)
            VALUES ($1, $2, $3, $4)
            RETURNING id, content, business_id, attachments, created_at
        `, [userId, business_id || null, content, attachments]);

        return res.status(201).json({
            success: true,
            message: "Notice posted successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error posting notice:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function fetchNotices(req, res) {
    try {
        const businessId = req.user.business_id;

        const result = await pool.query(`
            SELECT n.id, n.content, n.attachments, n.created_at, u.user_name AS author
            FROM notices n
            JOIN users u ON u.id = n.user_id
            WHERE n.business_id IS NULL OR n.business_id = $1
            ORDER BY n.created_at DESC
        `, [businessId]);

        return res.status(200).json({
            success: true,
            message: "Notices fetched successfully",
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching notices:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function updateNotice(req, res) {
    try {
        const { notice_id } = req.params;
        const { content } = req.body;
        const attachments = req.files ? req.files.map(f => f.path) : [];
        const userId = req.user.id;

        const noticeRes = await pool.query(`SELECT user_id FROM notices WHERE id = $1`, [notice_id]);
        if (!noticeRes.rows.length) {
            return res.status(404).json({ success: false, message: "Notice not found" });
        }

        const isAuthor = noticeRes.rows[0].user_id === userId;

        const adminRes = await pool.query(`
            SELECT 1
            FROM users u
            JOIN roles r ON u.role_id = r.id
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = $1 AND p.name = 'manage_platform'
        `, [userId]);

        if (!isAuthor && !adminRes.rows.length) {
            return res.status(403).json({ success: false, message: "You cannot update this notice" });
        }

        const result = await pool.query(`
            UPDATE notices
            SET content = $1,
                attachments = CASE WHEN array_length($2::text[], 1) > 0 THEN $2 ELSE attachments END,
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, content, attachments, updated_at
        `, [content, attachments, notice_id]);

        return res.status(200).json({
            success: true,
            message: "Notice updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating notice:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function deleteNotice(req, res) {
    try {
        const { notice_id } = req.params;
        const userId = req.user.id;

        const noticeRes = await pool.query(`SELECT user_id FROM notices WHERE id = $1`, [notice_id]);
        if (!noticeRes.rows.length) {
            return res.status(404).json({ success: false, message: "Notice not found" });
        }

        const isAuthor = noticeRes.rows[0].user_id === userId;

        const adminRes = await pool.query(`
            SELECT 1
            FROM users u
            JOIN roles r ON u.role_id = r.id
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = $1 AND p.name = 'manage_platform'
        `, [userId]);

        if (!isAuthor && !adminRes.rows.length) {
            return res.status(403).json({ success: false, message: "You cannot delete this notice" });
        }

        await pool.query(`DELETE FROM notices WHERE id = $1`, [notice_id]);

        return res.status(200).json({
            success: true,
            message: "Notice deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting notice:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}


module.exports = { postNotice, fetchNotices, updateNotice, deleteNotice };
