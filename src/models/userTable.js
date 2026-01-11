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
            business_id INTEGER,
            role_id INTEGER,
            is_verified BOOLEAN DEFAULT FALSE,
            reset_password_token VARCHAR(255),
            reset_password_expires TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CHECK(char_length(password) >=6),
            
            CONSTRAINT fk_roles_users
            FOREIGN KEY (role_id)
            REFERENCES roles(id)
            );
            
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
            CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
            `)

        console.log(`User table created successfully`)
    } catch (error) {
        console.error(`Error creating user table`, error)
    }
}

module.exports = userTable;