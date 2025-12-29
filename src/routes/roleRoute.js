const express = require("express");
const { getRoles, updateRolePermissions, getPermissions } = require("../controllers/roleController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", checkPermission("manage_platform"), getRoles);
router.get("/permissions", checkPermission("manage_platform"), getPermissions);
router.post("/update-permissions", checkPermission("manage_platform"), updateRolePermissions);

module.exports = router;
