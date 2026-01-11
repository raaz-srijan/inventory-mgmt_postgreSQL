const express = require("express");
const { login, registerStaff, getStaff, updateProfile, updateStaff, deleteStaff, forgotPassword, resetPassword } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/register-staff", authMiddleware, checkPermission("manage_business_roles"), registerStaff);
router.get("/staff", authMiddleware, checkPermission(["manage_business_roles", "manage_staff_roles"], "BUSINESS"), getStaff);
router.put("/update-profile", authMiddleware, updateProfile);

// Staff management
router.put("/staff/:id", authMiddleware, checkPermission(["manage_business_roles", "manage_staff_roles"]), updateStaff);
router.delete("/staff/:id", authMiddleware, checkPermission(["manage_business_roles"]), deleteStaff); // Strictly for owner? or maybe manager too? 

module.exports = router;
