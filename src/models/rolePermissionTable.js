const pool = require("../config/connectDb");

async function rolePermissionTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS role_permissions(
                role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
                permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
                PRIMARY KEY (role_id, permission_id)
            );
        `);
        console.log(`Role-Permission junction table created successfully`);
    } catch (error) {
        console.error(`Error creating role_permissions table`, error);
    }
}

module.exports = rolePermissionTable;
