const pool = require("../config/connectDb");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../utils/uploadImage");
const sendRegistrationConfirmation = require("../utils/sendEmail");

async function registerBusiness(req, res) {
    try {
        const { business_name, address, license_no, citizenship_no, user_name, email, password, phone } = req.body;
        const { license_img, citizenship_front_img, citizenship_back_img } = req.files;

        if (!business_name || !address || !license_no || !license_img || !citizenship_no || !citizenship_front_img || !citizenship_back_img || !user_name || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: "Please fill all the required fields" });
        }

        const checkUser = await pool.query(`SELECT id FROM businesses WHERE license_no = $1`, [license_no]);

        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "License is already registered" });
        }

        const uploadedLicense = await uploadImage(license_img[0].path);
        const uploadCitizenshipFront = await uploadImage(citizenship_front_img[0].path);
        const uploadCitizenshipBack = await uploadImage(citizenship_back_img[0].path);

        const hashedPassword = await bcrypt.hash(password, 12);

        const userResult = await pool.query(
            `INSERT INTO users(user_name, email, password, phone)
            VALUES ($1, $2, $3, $4) RETURNING id, email`,
            [user_name, email, hashedPassword, phone]
        );

        const businessResult = await pool.query(
            `INSERT INTO businesses (business_name, license_no, address, license_img, citizenship_no, citizenship_front_img, citizenship_back_img)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [business_name, license_no, address, uploadedLicense, citizenship_no, uploadCitizenshipFront, uploadCitizenshipBack]
        );

        await sendRegistrationConfirmation(userResult.rows[0].email);

        return res.status(201).json({
            success: true,
            message: "Business registered successfully. A confirmation email has been sent to the provided email address."
        });

    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function fetchAllBusinesses(req, res) {
    try {
        const result = await pool.query(`
            SELECT
                b.id AS business_id,
                b.business_name,
                b.address,
                b.license_no,
                b.status,
                b.created_at,

                u.user_name,
                u.email,
                u.phone
            FROM businesses b
            JOIN users u ON u.id = b.owner_id
            ORDER BY b.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            message: "Businesses fetched successfully",
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


async function fetchBusinessById(req, res) {
    try {
        const { business_id } = req.params;

        if (!business_id) {
            return res.status(400).json({
                success: false,
                message: "Business ID is required"
            });
        }

        const result = await pool.query(
            `
            SELECT
                b.id AS business_id,
                b.business_name,
                b.address,
                b.license_no,
                b.status,

                u.id AS owner_id,
                u.user_name,
                u.email,
                u.phone
            FROM businesses b
            JOIN users u ON u.id = b.owner_id
            WHERE b.id = $1
            `,
            [business_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
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


module.exports = { registerBusiness, fetchAllBusinesses, fetchBusinessById };
