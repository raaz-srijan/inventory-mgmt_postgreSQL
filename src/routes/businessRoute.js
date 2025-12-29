const express = require("express");
const { register, fetchBusiness } = require("../controllers/businessController");
const upload = require("../utils/multer")
const router = express.Router();

router.post(
  "/create", upload.fields([
    { name: "license_img", maxCount: 1 },
    { name: "citizenship_front", maxCount: 1 },
    { name: "citizenship_back", maxCount: 1 }
  ]),register
);

router.get("/", fetchBusiness);

module.exports = router;