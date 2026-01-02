const express = require('express');
const app = express();

app.use(express.json());
require('dotenv').config();

const PORT = process.env.PORT;

const userRoute = require("./routes/userRoute");
const rolePermissionRoute = require("./routes/rolePermissionRoute");
const businessRoute = require("./routes/businessRoute");
const adminRoute = require("./routes/adminRoute");


app.use("/api/users", userRoute);
app.use("/api/roles-permissions", rolePermissionRoute);
app.use('/api/business', businessRoute);
app.use('/api/admin', adminRoute);

app.listen(PORT, ()=> {
    console.log(`Server started on ${PORT}`);
});

