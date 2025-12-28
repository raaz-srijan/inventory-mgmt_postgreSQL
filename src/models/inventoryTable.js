const pool = require("../config/connectDb");

async function inventoryTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inventories(
            id SERIAL PRIMARY KEY,
            business_id INTEGER,
            name VARCHAR(100) NOT NULL UNIQUE,
            stock INTEGER,
            price INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_businesses_inventories
            FOREIGN KEY (business_id)
            REFERENCES businesses(id)
            );
            `)
            console.log(`Inventory table created successfully`);
    } catch (error) {
        console.error(`Error creating table`, error);
    }
}

module.exports = inventoryTable;