const pool =require("../config/connectDb");

async function businessTable() {

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS businesses(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            license_no INTEGER UNIQUE,
            is_verified BOOLEAN DEFAULT FALSE,
            licenseImg VARCHAR(100),
            citizenship_no INTEGER NOT NULL,
            citizenship_fron VARCHAR(100),
            citizenship_back VARCHAR(100),
            address VARCHAR(100),
            owner_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_users_businesses
            FOREIGN KEY (owner_id)
            REFERENCES users(id)
            );
            `)

            console.log(`Business table created successfully`);
    } catch (error) {
        console.error(`Error creating table`, error);
    }
}

module.exports = businessTable;