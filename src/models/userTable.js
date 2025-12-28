const pool = require("../config/connectDb");


async function userTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            phone VARCHAR(100),
            is_verified BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            
            CHECK(char_length(password) >= 6)
            )
            `)

            console.log(`User table created successfully`);
    } catch (error) {
        console.error(`Error creating table`, error);
    }
}

module.exports = userTable;