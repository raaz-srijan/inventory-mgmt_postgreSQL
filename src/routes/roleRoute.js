const express = require("express");
const { getRoles, updateRolePermissions, getPermissions, createRole, createPermission } = require("../controllers/roleController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", checkPermission("manage_platform", "PLATFORM"), getRoles);
router.post("/", checkPermission("manage_platform", "PLATFORM"), createRole); 

router.get("/permissions", checkPermission("manage_platform", "PLATFORM"), getPermissions);
router.post("/permissions", checkPermission("manage_platform", "PLATFORM"), createPermission); 

router.post("/update-permissions", checkPermission("manage_platform", "PLATFORM"), updateRolePermissions);

module.exports = router;
