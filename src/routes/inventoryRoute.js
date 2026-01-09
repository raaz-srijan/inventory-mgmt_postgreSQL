const express = require("express");
const { createItem, getItems, updateItem, deleteItem } = require("../controllers/inventoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", checkPermission("update_inventory", "BUSINESS"), createItem);
router.get("/", (req, res, next) => {
    const perms = req.user.permissions;
    if (perms.includes("view_assigned_inventory") || perms.includes("update_inventory") || perms.includes("view_business_dashboard")) {
        return next();
    }
    return res.status(403).json({ message: "Permission denied to view inventory" });
}, getItems);

router.put("/:id", checkPermission("update_inventory", "BUSINESS"), updateItem);
router.delete("/:id", checkPermission("update_inventory", "BUSINESS"), deleteItem);

module.exports = router;
