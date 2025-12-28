const express = require('express');
const userTable = require('./models/userTable');
const roleTable = require('./models/roleTable');
const permissionTable = require('./models/permissionTable');
const businessTable = require('./models/businessTable');
const inventoryTable = require('./models/inventoryTable');
const messageTable = require('./models/messageTable');
const connectCloudinary = require('./config/cloudinary');

const app = express();
app.use(express.json());

require('dotenv').config();

const PORT = process.env.PORT;

app.listen(PORT, ()=> {
    console.log(`Server started on ${PORT}`);
    userTable();
    roleTable();
    permissionTable();
    // businessTable();
    inventoryTable();
    messageTable();
    connectCloudinary();
})