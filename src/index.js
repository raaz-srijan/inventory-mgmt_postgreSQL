const express = require('express');

const pool = require("./config/connectDb");
const userTable = require('./models/userTable');
const roleTable = require('./models/roleTable');
const permissionTable = require('./models/permissionTable');
const rolePermissionTable = require('./models/rolePermissionTable');
const businessTable = require('./models/businessTable');
const inventoryTable = require('./models/inventoryTable');
const messageTable = require('./models/messageTable');
const ticketTable = require('./models/ticketTable');
const noticeTable = require('./models/noticeTable');
const connectCloudinary = require('./config/cloudinary');
const seedData = require('./utils/dbSeed');

const app = express();
app.use(express.json());

require('dotenv').config();

const cors = require("cors");

app.use(cors());

const PORT = process.env.PORT;

const businessRoute = require("./routes/businessRoute");
const authRoute = require("./routes/authRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const ticketRoute = require("./routes/ticketRoute");
const roleRoute = require("./routes/roleRoute");
const noticeRoute = require("./routes/noticeRoute");
const messageRoute = require("./routes/messageRoute");
const adminRoute = require("./routes/adminRoute");

app.use("/api/v1/business", businessRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/inventory", inventoryRoute);
app.use("/api/v1/tickets", ticketRoute);
app.use("/api/v1/roles", roleRoute);
app.use("/api/v1/notices", noticeRoute);
app.use("/api/v1/messages", messageRoute);
app.use("/api/v1/admins", adminRoute);

async function syncDb() {
    try {
        await permissionTable();
        await roleTable();
        await rolePermissionTable();
        await userTable();
        await businessTable();
        await inventoryTable();
        await messageTable();
        await ticketTable();
        await noticeTable();

        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role_id') THEN
                    ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id);
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_businesses_users') THEN
                    ALTER TABLE users ADD CONSTRAINT fk_businesses_users 
                    FOREIGN KEY (business_id) REFERENCES businesses(id);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='created_at') THEN
                    ALTER TABLE businesses ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                END IF;
            END $$;
        `);

        await seedData();

        console.log("Database synced successfully");
    } catch (error) {
        console.error("Database sync failed", error);
    }
}

app.listen(PORT, async () => {
    console.log(`Server started on ${PORT}`);
    await syncDb();
    connectCloudinary();
})