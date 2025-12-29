const pool = require("../config/connectDb");

async function roleTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS roles(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `)

        console.log(`Role table created successfully`);
    } catch (error) {
        console.error(`Error creating table`, error);
    }
}
module.exports = roleTable;