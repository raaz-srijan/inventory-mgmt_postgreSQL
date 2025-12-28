const pool = require("../config/connectDb");

async function userTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                is_verified BOOLEAN DEFAULT FALSE,
                business_id INTEGER NULL,
                role_id INTEGER NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_businesses_users
                FOREIGN KEY (business_id)
                REFERENCES businesses(id)
                DEFERRABLE INITIALLY DEFERRED,

                CONSTRAINT fk_roles_users
                FOREIGN KEY (role_id)
                REFERENCES roles(id)
            );
        `);

        console.log("User table created successfully");
    } catch (error) {
        console.error("Error creating table", error);
    }
}

module.exports = userTable;
