const express = require("express");
const { sendMessage, getMessages, getChatUsers } = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", sendMessage);
router.get("/users", getChatUsers);
router.get("/", getMessages);

module.exports = router;
