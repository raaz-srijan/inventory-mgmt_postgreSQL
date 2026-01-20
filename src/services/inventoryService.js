const pool = require("../config/connectDb");

class InventoryService {
    async createItem(businessId, data) {
        if (!businessId) throw new Error("Business context required for inventory creation");

        const { name, stock, price } = data;
        const result = await pool.query(
            `INSERT INTO inventories (name, stock, price, business_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, stock, price, businessId]
        );
        return result.rows[0];      
    }

    async getBusinessItems(businessId, page = 1, limit = 10) {
        if (!businessId) throw new Error("Business context required to fetch inventory");

        const offset = (page - 1) * limit;

        const countRes = await pool.query("SELECT COUNT(*) FROM inventories WHERE business_id = $1", [businessId]);
        const total = parseInt(countRes.rows[0].count);

        const result = await pool.query(
            "SELECT * FROM inventories WHERE business_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
            [businessId, limit, offset]
        );

        return {
            items: result.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async updateItem(businessId, itemId, data) {
        if (!businessId) throw new Error("Business context required to update inventory");

        const { name, stock, price } = data;
        const result = await pool.query(
            "UPDATE inventories SET name = $1, stock = $2, price = $3 WHERE id = $4 AND business_id = $5 RETURNING *",
            [name, stock, price, itemId, businessId]
        );

        if (result.rows.length === 0) {
            throw new Error("Item not found or unauthorized");
        }
        return result.rows[0];
    }

    async deleteItem(businessId, itemId) {
        if (!businessId) throw new Error("Business context required to delete inventory");

        const result = await pool.query(
            "DELETE FROM inventories WHERE id = $1 AND business_id = $2 RETURNING id",
            [itemId, businessId]
        );

        if (result.rows.length === 0) {
            throw new Error("Item not found or unauthorized");
        }
        return true;
    }
}

module.exports = new InventoryService();
