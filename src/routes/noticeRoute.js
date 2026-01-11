const express = require("express");
const { createNotice, getNotices, updateNotice, deleteNotice } = require("../controllers/noticeController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Admins or Super Admins can post platform notices
// Create (Permission check inside controller or here - keeping it simple here as controller handles logic)
router.post("/", createNotice);

router.get("/", getNotices);

// Update/Delete
router.put("/:id", updateNotice);
router.delete("/:id", deleteNotice);

module.exports = router;
