const pool = require("../config/connectDb");

async function ticketTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tickets(
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'open', -- open, in-progress, resolved, closed
                priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
                sender_id INTEGER REFERENCES users(id),
                business_id INTEGER REFERENCES businesses(id),
                assigned_to INTEGER REFERENCES users(id), -- SuperAdmin or Admin who will fix it
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_tickets_business_id ON tickets(business_id);
            CREATE INDEX IF NOT EXISTS idx_tickets_sender_id ON tickets(sender_id);
            CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
        `);
        console.log(`Ticket table created successfully`);
    } catch (error) {
        console.error(`Error creating ticket table`, error);
    }
}

module.exports = ticketTable;
