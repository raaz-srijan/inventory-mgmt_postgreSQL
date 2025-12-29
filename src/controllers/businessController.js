const bcrypt = require("bcrypt");
const { uploadImage } = require("../utils/uploadImage");
const pool = require("../config/connectDb");

async function register(req, res) {
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

        const { license_img, citizenship_front, citizenship_back } = req.files;

        if (!businessName || !license_no || !address || !userName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: "Please fill all the required fields" });
        }


        const checkData = await pool.query(
            `SELECT license_no FROM businesses WHERE license_no = $1`,
            [license_no]
        );

        if (checkData.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Business already registered with this license number" });
        }

        const uploadedLicense = await uploadImage(license_img[0].path);
        const uploadedCitizenshipFront = await uploadImage(citizenship_front[0].path);
        const uploadedCitizenshipBack = await uploadImage(citizenship_back[0].path);

        const hashedPassword = await bcrypt.hash(password, 12);

        const userResult = await pool.query(
            `INSERT INTO users (name, email, password, phone, business_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userName, email, hashedPassword, phone, null]
        );
        const userId = userResult.rows[0].id;

        const businessResult = await pool.query(
            `INSERT INTO businesses
                (name, license_no, license_img, citizenship_no, citizenship_front, citizenship_back, address, owner_id)
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

        await pool.query(
            `UPDATE users SET business_id = $1 WHERE id = $2`,
            [businessId, userId]
        );


        return res.status(201).json({
            success: true,
            message: "Business and user registered successfully",
            user: userResult.rows[0],
            business: businessResult.rows[0]
        });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function fetchBusiness(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        b.id AS business_id,
        b.name AS business_name,
        b.license_no,
        b.license_img,
        b.citizenship_no,
        b.citizenship_front,
        b.citizenship_back,
        b.address,
        u.id AS user_id,
        u.name AS owner_name,
        u.email,
        u.phone
      FROM businesses b
      JOIN users u ON u.business_id = b.id
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

module.exports = { register, fetchBusiness };
