const express = require("express");
const { createNotice, getNotices } = require("../controllers/noticeController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", checkPermission("post_global_announcements", "PLATFORM"), createNotice);
router.post("/business", checkPermission("post_business_notices", "BUSINESS"), createNotice);
router.get("/", getNotices);

module.exports = router;
