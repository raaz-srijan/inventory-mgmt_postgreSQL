const express = require("express");
const { createNotice, getNotices, updateNotice, deleteNotice } = require("../controllers/noticeController");
const authMiddleware = require("../middlewares/authMiddleware");


const router = express.Router();

router.use(authMiddleware);

router.post("/", createNotice);

router.get("/", getNotices);

router.put("/:id", updateNotice);
router.delete("/:id", deleteNotice);

module.exports = router;
