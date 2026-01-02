const express = require('express');
const {register, login, verifyUser} = require('../controllers/userController');

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify/:token", verifyUser);


module.exports = router