const pool = require("../config/connectDb");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../utils/uploadImage");

async function register(req, res) {
    const client = await pool.connect(); 
    try {
        const {
            businessName,
            license_no,
            citizenship_no,
            address,
            userName,
            email,
            password,
            phone
        } = req.body;

        const { licenseImg, citizenship_front, citizenship_back } = req.files;

        if (!businessName || !license_no || !address || !userName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: "Please fill all the required fields" });
        }

        await client.query('BEGIN'); 

        const checkData = await client.query(
            `SELECT license_no FROM businesses WHERE license_no = $1`,
            [license_no]
        );

        if (checkData.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: "Business already registered with this license number" });
        }

        const uploadedLicense = await uploadImage(licenseImg[0].path);
        const uploadedCitizenshipFront = await uploadImage(citizenship_front[0].path);
        const uploadedCitizenshipBack = await uploadImage(citizenship_back[0].path);

        const hashedPassword = await bcrypt.hash(password, 12);

        const userResult = await client.query(
            `INSERT INTO users (user_name, email, password, phone, business_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userName, email, hashedPassword, phone, null]
        );
        const userId = userResult.rows[0].id;

        const businessResult = await client.query(
            `INSERT INTO businesses
                (business_name, license_no, license_img, citizenship_no, citizenship_front_img, citizenship_back_img, address, owner_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
             RETURNING *`,
            [
                businessName,
                license_no,
                uploadedLicense.secure_url,
                citizenship_no,
                uploadedCitizenshipFront.secure_url,
                uploadedCitizenshipBack.secure_url,
                address,
                userId
            ]
        );
        const businessId = businessResult.rows[0].id;

        await client.query(
            `UPDATE users SET business_id = $1 WHERE id = $2`,
            [businessId, userId]
        );

        await client.query('COMMIT'); 

        return res.status(201).json({
            success: true,
            message: "Business and user registered successfully",
            user: userResult.rows[0],
            business: businessResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    } finally {
        client.release();
    }
}

module.exports = { register };
