const express = require("express");
const { login, registerStaff, getStaff } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/register-staff", authMiddleware, checkPermission("manage_business_roles"), registerStaff); // Only owner can register for now, or maybe managers too? strict to owner for now for registration.
router.get("/staff", authMiddleware, checkPermission(["manage_business_roles", "manage_staff_roles"], "BUSINESS"), getStaff);

module.exports = router;
