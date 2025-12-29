const pool = require("../config/connectDb");

async function userTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(100),
            business_id INTEGER DEFAULT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CHECK(char_length(password) >=6),
            CONSTRAINT fk_businesses_users
            FOREIGN KEY (business_id)
            REFERENCES businesses_id
            );
            `)

            console.log(`User table created successfully`)
    } catch (error) {
        console.error(`Error creating table`, error)
    }
}

module.exports = userTable;