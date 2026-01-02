const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
  postNotice,
  fetchNotices,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

router.get("/", fetchNotices);

router.post("/business", upload.array("attachments", 3), postNotice);

router.post("/global", upload.array("attachments", 3), postNotice);

router.put("/:notice_id", upload.array("attachments", 3), updateNotice);

router.delete("/:notice_id", deleteNotice);

module.exports = router;
