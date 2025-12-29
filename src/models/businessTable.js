const pool = require("../config/connectDb");

async function businessTable() {
try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS businesses(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        license_no VARCHAR(255) NOT NULL,
        license_img VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        citizenship_no VARCHAR(255) NOT NULL,
        citizenship_front VARCHAR(255) NOT NULL,
        citizenship_back VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        owner_id INTEGER DEFAULT NULL,

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