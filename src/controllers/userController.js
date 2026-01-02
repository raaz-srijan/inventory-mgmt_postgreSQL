const pool = require("../config/connectDb");

const bcrypt = require('bcrypt');

const {generateJWT, verifyJWT} = require("../utils/generateToken");
const sendVerification = require("../utils/sendEmail");

async function register(req, res) {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone)
            return res.status(400).json({ success: false, message: "Please fill all the required fields" });

        const existUser = await pool.query(
            `SELECT id FROM users WHERE email = $1`,
            [email]
        );

        if (existUser.rows.length > 0)
            return res.status(400).json({ success: false, message: "User already registered with this email" });

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, phone)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [name, email, hashedPassword, phone]
        );

        const token = await generateJWT({ id: newUser.rows[0].id });

        await sendVerification(email, token);

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email."
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}



async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, message: "Please fill all the required fields" });

        const checkUser = await pool.query(
            `SELECT id, password, is_verified FROM users WHERE email = $1`,
            [email]
        );

        if (checkUser.rows.length === 0)
            return res.status(400).json({ success: false, message: "Incorrect email or password" });

        const user = checkUser.rows[0];

        if(!user.is_verified)
            return res.status(400).json({success:false, message:"Please verify your email address"});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ success: false, message: "Incorrect email or password" });

        const token = await generateJWT({ id: user.id });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


async function verifyUser(req, res) {
    try {
        const { token } = req.params;

        if (!token)
            return res.status(400).json({ success: false, message: "Invalid token" });

        const decoded = await verifyJWT(token);
        const userId = decoded.id;

        const checkUser = await pool.query(
            `SELECT id, is_verified FROM users WHERE id = $1`,
            [userId]
        );

        if (checkUser.rows.length === 0)
            return res.status(404).json({ success: false, message: "User not found" });

        if (checkUser.rows[0].is_verified)
            return res.status(400).json({ success: false, message: "User already verified" });

        await pool.query(
            `UPDATE users
             SET is_verified = true
             WHERE id = $1`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Email verified successfully!"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}


async function updateUser(req, res) {
    try {
        const { name, email, password, confirmPassword, phone } = req.body;
        const userId = req.user.id; 

        if (password && password !== confirmPassword)
            return res.status(400).json({ success: false, message: "Passwords do not match" });

        const updatedFields = [];
        const values = [];
        let index = 1;

        if (name) {
            updatedFields.push(`name = $${index}`);
            values.push(name);
            index++;
        }
        if (email) {
            updatedFields.push(`email = $${index}`);
            values.push(email);
            index++;
        }
        if (phone) {
            updatedFields.push(`phone = $${index}`);
            values.push(phone);
            index++;
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 12);
            updatedFields.push(`password = $${index}`);
            values.push(hashedPassword);
            index++;
        }

        if (updatedFields.length === 0)
            return res.status(400).json({ success: false, message: "No fields to update" });

        values.push(userId);

        const result = await pool.query(
            `UPDATE users SET ${updatedFields.join(", ")} WHERE id = $${index} RETURNING id, name, email, phone`,
            values
        );

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: result.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}


async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        if (!id)
            return res.status(400).json({ success: false, message: "Invalid id" });

        const result = await pool.query(
            `DELETE FROM users WHERE id = $1`,
            [id]
        );

        if (result.rowCount === 0)
            return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

module.exports = {register, login, verifyUser, updateUser, deleteUser}