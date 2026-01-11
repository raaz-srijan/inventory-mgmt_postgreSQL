const express = require("express");
const { getAdmins, createAdmin, deleteAdmin } = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", checkPermission("manage_platform", "PLATFORM"), getAdmins);
router.post("/", checkPermission("manage_platform", "PLATFORM"), createAdmin);
router.delete("/:id", checkPermission("manage_platform", "PLATFORM"), deleteAdmin);

module.exports = router;
