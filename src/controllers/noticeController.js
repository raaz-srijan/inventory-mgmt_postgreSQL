const pool = require("../config/connectDb");

const createNotice = async (req, res) => {
    try {
        const { title, content, type } = req.body;
        const { id: userId, business_id, permissions } = req.user;

        let noticeType = 'business';
        let noticeBusinessId = business_id;

        if (type === 'global') {
            const hasGlobalPerm =
                permissions.includes('manage_platform') ||
                permissions.includes('post_global_announcements') ||
                permissions.includes('post_admin_notices');

            if (!hasGlobalPerm) {
                return res.status(403).json({ success: false, message: "Unauthorized to post global notices" });
            }
            noticeType = 'global';
            noticeBusinessId = null;
        } else {
            if (!business_id) {
                return res.status(400).json({ success: false, message: "No business context found for business notice" });
            }
            const canPostBusiness = permissions.includes('manage_business') || permissions.includes('manage_staff_roles'); // heuristic
        }

        const result = await pool.query(
            "INSERT INTO notices (title, content, type, business_id, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, content, noticeType, noticeBusinessId, userId]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Create notice error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getNotices = async (req, res) => {
    try {
        const { type } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let query = `
            SELECT n.*, u.name as creator_name 
            FROM notices n
            LEFT JOIN users u ON n.created_by = u.id
            WHERE 1=1
        `;
        let countQuery = `SELECT COUNT(*) FROM notices n WHERE 1=1`;
        const queryParams = [];
        const countParams = [];

        if (type === 'global') {
            query += " AND n.type = 'global'";
            countQuery += " AND n.type = 'global'";
        } else if (type === 'business') {
            query += " AND n.business_id = $1 AND n.type = 'business'";
            countQuery += " AND n.business_id = $1 AND n.type = 'business'";
            queryParams.push(req.user.business_id);
            countParams.push(req.user.business_id);
        } else {
            query += " AND (n.type = 'global' OR n.business_id = $1)";
            countQuery += " AND (n.type = 'global' OR n.business_id = $1)";
            queryParams.push(req.user.business_id);
            countParams.push(req.user.business_id);
        }

        const countRes = await pool.query(countQuery, countParams);
        const total = parseInt(countRes.rows[0].count);

        query += ` ORDER BY n.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);

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
        console.error("Get notices error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const { id: userId, business_id, permissions } = req.user;

        const noticeRes = await pool.query("SELECT * FROM notices WHERE id = $1", [id]);
        if (noticeRes.rows.length === 0) return res.status(404).json({ message: "Notice not found" });

        const notice = noticeRes.rows[0];

        let authorized = false;

        if (notice.type === 'global') {
            if (
                permissions.includes('manage_platform') ||
                permissions.includes('post_global_announcements') ||
                permissions.includes('post_admin_notices')
            ) {
                authorized = true;
            }
        } else {
            if (notice.business_id === business_id && (permissions.includes('manage_business') || notice.created_by === userId)) {
                authorized = true;
            }
        }

        if (!authorized) return res.status(403).json({ message: "Unauthorized to edit this notice" });

        const result = await pool.query(
            "UPDATE notices SET title = $1, content = $2 WHERE id = $3 RETURNING *",
            [title, content, id]
        );

        res.status(200).json({ success: true, data: result.rows[0] });

    } catch (error) {
        console.error("Update notice error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, business_id, permissions } = req.user;

        const noticeRes = await pool.query("SELECT * FROM notices WHERE id = $1", [id]);
        if (noticeRes.rows.length === 0) return res.status(404).json({ message: "Notice not found" });
        const notice = noticeRes.rows[0];

        let authorized = false;
        if (notice.type === 'global') {
            if (
                permissions.includes('manage_platform') ||
                permissions.includes('post_global_announcements') ||
                permissions.includes('post_admin_notices')
            ) {
                authorized = true;
            }
        } else {
            if (notice.business_id === business_id && (permissions.includes('manage_business') || notice.created_by === userId)) {
                authorized = true;
            }
        }

        if (!authorized) return res.status(403).json({ message: "Unauthorized to delete this notice" });

        await pool.query("DELETE FROM notices WHERE id = $1", [id]);
        res.status(200).json({ success: true, message: "Notice deleted" });

    } catch (error) {
        console.error("Delete notice error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createNotice, getNotices, updateNotice, deleteNotice };
