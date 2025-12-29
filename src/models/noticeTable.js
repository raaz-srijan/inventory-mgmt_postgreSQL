const pool = require("../config/connectDb");

async function noticeTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notices(
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'global', -- global, business
                business_id INTEGER REFERENCES businesses(id), -- NULL for global
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(`Notice table created successfully`);
    } catch (error) {
        console.error(`Error creating notice table`, error);
    }
}

module.exports = noticeTable;
