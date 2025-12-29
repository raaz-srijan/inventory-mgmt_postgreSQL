const express = require("express");
const { createItem, getItems, updateItem, deleteItem } = require("../controllers/inventoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", checkPermission("update_inventory"), createItem);
router.get("/", checkPermission("view_assigned_inventory"), getItems);
router.put("/:id", checkPermission("update_inventory"), updateItem);
router.delete("/:id", checkPermission("update_inventory"), deleteItem);

module.exports = router;
