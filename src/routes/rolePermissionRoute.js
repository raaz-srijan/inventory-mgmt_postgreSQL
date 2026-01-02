const express = require("express");
const { createRole, getRoles, updateRole, deleteRole, createPermission, getPermissions, deletePermission, updateRolePermissions } = require("../controllers/role-permissionController");
const router = express.Router();


router.post("/roles", createRole);
router.get("/roles", getRoles);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);
router.post("/permissions", createPermission);
router.get("/permissions", getPermissions);
router.delete("/permissions/:id", deletePermission);
router.put("/roles/permissions", updateRolePermissions);

module.exports = router;
