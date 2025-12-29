const express = require("express");
const { login, registerStaff } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/register-staff", authMiddleware, checkPermission("manage_business_roles"), registerStaff);

module.exports = router;
