const inventoryService = require("../services/inventoryService");

const createItem = async (req, res) => {
    try {
        const item = await inventoryService.createItem(req.user.business_id, req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        console.error("Create item error:", error);
        res.status(error.message.includes("context") ? 403 : 500).json({ success: false, message: error.message });
    }
};

const getItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await inventoryService.getBusinessItems(req.user.business_id, page, limit);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("Get items error:", error);
        res.status(error.message.includes("context") ? 403 : 500).json({ success: false, message: error.message });
    }
};


const updateItem = async (req, res) => {
    try {
        const item = await inventoryService.updateItem(req.user.business_id, req.params.id, req.body);
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Update item error:", error);
        const status = error.message.includes("unauthorized") ? 403 : 500;
        res.status(status).json({ success: false, message: error.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        await inventoryService.deleteItem(req.user.business_id, req.params.id);
        res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
        console.error("Delete item error:", error);
        const status = error.message.includes("unauthorized") ? 403 : 500;
        res.status(status).json({ success: false, message: error.message });
    }
};

module.exports = { createItem, getItems, updateItem, deleteItem };
