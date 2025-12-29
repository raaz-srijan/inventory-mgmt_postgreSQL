const pool = require("../config/connectDb");

const createItem = async (req, res) => {
    try {
        const { name, stock, price } = req.body;
        const business_id = req.user.business_id;

        if (!business_id) {
            return res.status(403).json({ message: "You must be associated with a business to manage inventory" });
        }

        const result = await pool.query(
            `INSERT INTO inventories (name, stock, price, business_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, stock, price, business_id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Create item error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getItems = async (req, res) => {
    try {
        const business_id = req.user.business_id;

        if (!business_id) {
            if (req.user.role_name === 'admin' || req.user.role_name === 'super_admin') {
                return res.status(403).json({ message: "Admins/SuperAdmins cannot access business inventory data" });
            }
            return res.status(403).json({ message: "Access denied" });
        }

        const result = await pool.query(
            "SELECT * FROM inventories WHERE business_id = $1",
            [business_id]
        );

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Get items error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, stock, price } = req.body;
        const business_id = req.user.business_id;

        const checkRes = await pool.query("SELECT business_id FROM inventories WHERE id = $1", [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ message: "Item not found" });

        if (checkRes.rows[0].business_id !== business_id) {
            return res.status(403).json({ message: "Unauthorized access to this item" });
        }

        const result = await pool.query(
            "UPDATE inventories SET name = $1, stock = $2, price = $3 WHERE id = $4 RETURNING *",
            [name, stock, price, id]
        );

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Update item error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const business_id = req.user.business_id;

        const checkRes = await pool.query("SELECT business_id FROM inventories WHERE id = $1", [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ message: "Item not found" });

        if (checkRes.rows[0].business_id !== business_id) {
            return res.status(403).json({ message: "Unauthorized access to this item" });
        }

        await pool.query("DELETE FROM inventories WHERE id = $1", [id]);
        res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
        console.error("Delete item error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createItem, getItems, updateItem, deleteItem };
