const bcrypt = require("bcrypt");
const {
  uploadImage,
  deleteImagefromCloudinary,
} = require("../utils/uploadImage");
const pool = require("../config/connectDb");
const {
  sendRegistrationEmail,
  sendVerificationEmail,
  sendBusinessApprovalEmail,
} = require("../utils/sendEmail");

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
      phone,
    } = req.body;

    const { license_img, citizenship_front, citizenship_back } = req.files;

    if (
      !businessName ||
      !license_no ||
      !address ||
      !userName ||
      !email ||
      !password ||
      !phone
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please fill all the required fields",
        });
    }

    const checkData = await pool.query(
      `SELECT license_no FROM businesses WHERE license_no = $1`,
      [license_no]
    );

    if (checkData.rows.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Business already registered with this license number",
        });
    }

    const uploadedLicense = await uploadImage(license_img[0].path);
    const uploadedCitizenshipFront = await uploadImage(
      citizenship_front[0].path
    );
    const uploadedCitizenshipBack = await uploadImage(citizenship_back[0].path);

    const hashedPassword = await bcrypt.hash(password, 12);

    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE name = 'owner'"
    );
    const ownerRoleId = roleResult.rows[0].id;

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, phone, business_id, role_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, phone, role_id, business_id`,
      [userName, email, hashedPassword, phone, null, ownerRoleId]
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
        userId,
      ]
    );
    const businessId = businessResult.rows[0].id;

    await pool.query(`UPDATE users SET business_id = $1 WHERE id = $2`, [
      businessId,
      userId,
    ]);

    await sendRegistrationEmail(userResult.rows[0], businessResult.rows[0]);

    return res.status(201).json({
      success: true,
      message: "Business and user registered successfully",
      user: { ...userResult.rows[0], business_id: businessId },
      business: businessResult.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function fetchBusiness(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countRes = await pool.query("SELECT COUNT(*) FROM businesses");
    const total = parseInt(countRes.rows[0].count);

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
        b.is_verified,
        u.id AS user_id,
        u.name AS owner_name,
        u.email,
        u.phone,
        b.created_at
      FROM businesses b
      JOIN users u ON b.owner_id = u.id
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return res.status(200).json({
      success: true,
      message: "Businesses fetched successfully",
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function updateBusinessStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    if (typeof is_verified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_verified must be a boolean",
      });
    }

    const result = await pool.query(
      `UPDATE businesses
       SET is_verified = $1
       WHERE id = $2
       RETURNING *;`,
      [is_verified, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const ownerRes = await pool.query(
      `SELECT u.name, u.email FROM users u 
       JOIN businesses b ON b.owner_id = u.id 
       WHERE b.id = $1`,
      [id]
    );

    if (ownerRes.rows.length > 0) {
      if (is_verified) {
        await sendBusinessApprovalEmail(ownerRes.rows[0]);
      } else {
        await sendVerificationEmail(ownerRes.rows[0], is_verified);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Business verification status updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getMyBusiness(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM businesses WHERE owner_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getBusinessById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        b.id AS business_id,
        b.name AS business_name,
        b.license_no,
        b.license_img,
        b.citizenship_no,
        b.citizenship_front,
        b.citizenship_back,
        b.address,
        b.is_verified,
        u.id AS user_id,
        u.name AS owner_name,
        u.email,
        u.phone
      FROM businesses b
      LEFT JOIN users u ON b.owner_id = u.id
      WHERE b.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business fetched successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function deleteBusiness(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const businessResult = await pool.query(
      `SELECT license_img, citizenship_front, citizenship_back
       FROM businesses
       WHERE id = $1`,
      [id]
    );

    if (businessResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }

    const business = businessResult.rows[0];

    const publicIds = [
      business.license_img,
      business.citizenship_front,
      business.citizenship_back,
    ];

    for (const publicId of publicIds) {
      if (publicId) {
        await deleteImagefromCloudinary(publicId);
      }
    }

    await pool.query(`DELETE FROM businesses WHERE id = $1`, [id]);

    return res
      .status(200)
      .json({ success: true, message: "Business deleted successfully" });
  } catch (error) {
    console.error("Delete business error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function updateBusinessProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, license_no, address, citizenship_no } = req.body;

    // Get current business data to compare
    const currentRes = await pool.query(
      "SELECT * FROM businesses WHERE owner_id = $1",
      [userId]
    );

    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const current = currentRes.rows[0];
    let is_verified = current.is_verified;

    // Check if sensitive info changed
    if (
      (name && name !== current.name) ||
      (license_no && license_no !== current.license_no) ||
      (address && address !== current.address) ||
      (citizenship_no && citizenship_no !== current.citizenship_no)
    ) {
      is_verified = false;
    }

    // Handle image updates if needed
    let license_img = current.license_img;
    let citizenship_front = current.citizenship_front;
    let citizenship_back = current.citizenship_back;

    if (req.files) {
      const {
        license_img: newLicense,
        citizenship_front: newCF,
        citizenship_back: newCB
      } = req.files;

      if (newLicense) {
        if (current.license_img) await deleteImagefromCloudinary(current.license_img);
        const uploaded = await uploadImage(newLicense[0].path);
        license_img = uploaded.secure_url;
        is_verified = false;
      }
      if (newCF) {
        if (current.citizenship_front) await deleteImagefromCloudinary(current.citizenship_front);
        const uploaded = await uploadImage(newCF[0].path);
        citizenship_front = uploaded.secure_url;
        is_verified = false;
      }
      if (newCB) {
        if (current.citizenship_back) await deleteImagefromCloudinary(current.citizenship_back);
        const uploaded = await uploadImage(newCB[0].path);
        citizenship_back = uploaded.secure_url;
        is_verified = false;
      }
    }

    const result = await pool.query(
      `UPDATE businesses 
       SET name = COALESCE($1, name), 
           license_no = COALESCE($2, license_no), 
           address = COALESCE($3, address), 
           citizenship_no = COALESCE($4, citizenship_no),
           is_verified = $5,
           license_img = $6,
           citizenship_front = $7,
           citizenship_back = $8
       WHERE owner_id = $9
       RETURNING *`,
      [name, license_no, address, citizenship_no, is_verified, license_img, citizenship_front, citizenship_back, userId]
    );

    res.status(200).json({
      success: true,
      message: is_verified
        ? "Business profile updated successfully"
        : "Business profile updated successfully. Since sensitive information was changed, your verification status has been reset. Please wait for an admin to verify your profile again.",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Update business profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  register,
  fetchBusiness,
  updateBusinessStatus,
  getBusinessById,
  deleteBusiness,
  updateBusinessProfile,
  getMyBusiness,
};
