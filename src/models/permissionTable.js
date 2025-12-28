const pool = require("../config/connectDb");

async function permissionTable() {

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS permissions(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            group_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `);
            console.log(`Permission table created successfully`);
    } catch (error) {
        console.error(`Error creating table`, error);
    }
}


module.exports=permissionTable;