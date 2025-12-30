const pool = require("../config/connectDb");

async function roleTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        level INT NOT NULL CHECK (level > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Roles table created successfully");
  } catch (error) {
    console.error("Error creating roles table", error);
  }
}

module.exports = roleTable;
