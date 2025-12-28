const pool = require("../config/connectDb");

async function businessTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS businesses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                license_no VARCHAR(50) UNIQUE NOT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                license_img VARCHAR(255),
                citizenship_no VARCHAR(50) NOT NULL,
                citizenship_front VARCHAR(255),
                citizenship_back VARCHAR(255),
                address VARCHAR(255),
                owner_id INTEGER NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_users_businesses
                FOREIGN KEY (owner_id)
                REFERENCES users(id)
                DEFERRABLE INITIALLY DEFERRED
            );
        `);

        console.log("Business table created successfully");
    } catch (error) {
        console.error("Error creating table", error);
    }
}

module.exports = businessTable;
