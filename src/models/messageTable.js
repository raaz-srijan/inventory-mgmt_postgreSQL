const pool = require("../config/connectDb");

async function messageTable() {

    try {
        await pool.query(`
           CREATE TABLE IF NOT EXISTS messages(
           id SERIAL PRIMARY KEY,
           sender_id INTEGER,
           receiver_id INTEGER,
           business_id INTEGER,
           content VARCHAR(255) NOT NULL,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

           CONSTRAINT fk_messages_sender
           FOREIGN KEY (sender_id)
           REFERENCES users(id),

           CONSTRAINT fk_messages_receiver
           FOREIGN KEY (receiver_id)
           REFERENCES users(id),

           CONSTRAINT fk_businesses_messages
           FOREIGN KEY (business_id)
           REFERENCES businesses(id)
           ) ;
            
            `);

            console.log(`Message table created successfully`);
    } catch (error) {
        console.error(`Error creating table`, error)
    }
}


module.exports = messageTable;