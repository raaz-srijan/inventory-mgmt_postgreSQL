const pool = require('../config/connectDb');


async function fetchUnverifiedBusinesses(req, res) {
    try {
        const result = await pool.query(`
            SELECT id, business_name, license_no, address, created_at
            FROM businesses
            WHERE is_verified = false
            ORDER BY created_at DESC
        `);

        return res.status(200).json({
            success: true,
            message: "Unverified businesses fetched successfully",
            data: result.rows
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function fetchUnverifiedBusinessById(req, res) {
    try {
        const { business_id } = req.params;

        if (!business_id)
            return res.status(404).json({ success: false, message: "Invalid business ID" });

        const result = await pool.query(`
            SELECT 
                b.id AS business_id,
                b.business_name,
                b.license_no,
                b.license_img,
                b.citizenship_no,
                b.citizenship_front_img,
                b.citizenship_back_img,
                b.address,
                u.id AS user_id,
                u.user_name,
                u.email AS user_email,
                u.phone AS user_phone
            FROM businesses b
            JOIN users u ON u.id = b.owner_id
            WHERE b.id = $1 AND b.is_verified = false
        `, [business_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Unverified business not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function approveBusiness(req, res) {
    try {
        const { business_id } = req.params;

        if (!business_id)
            return res.status(404).json({ success: false, message: "Invalid business ID" });

        const result = await pool.query(
            `UPDATE businesses
             SET is_verified = true,
             WHERE id = $1
             RETURNING id, business_name, is_verified`,
            [business_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Business not found or already verified"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Business has been verified successfully",
            data: result.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}
async function deleteBusiness(req, res) {
    try {
        const { business_id } = req.params;

        if (!business_id)
            return res.status(400).json({ success: false, message: "Business ID is required" });

        const check = await pool.query(`SELECT id, owner_id FROM businesses WHERE id = $1`, [business_id]);

        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        const ownerId = check.rows[0].owner_id;

        await pool.query(`DELETE FROM businesses WHERE id = $1`, [business_id]);

        const userOtherBusinesses = await pool.query(`SELECT id FROM businesses WHERE owner_id = $1`, [ownerId]);

        if (userOtherBusinesses.rows.length === 0) {
            await pool.query(`DELETE FROM users WHERE id = $1`, [ownerId]);
        }

        return res.status(200).json({
            success: true,
            message: "Business deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting business:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

module.exports = {fetchUnverifiedBusinesses, fetchUnverifiedBusinessById, approveBusiness, deleteBusiness}