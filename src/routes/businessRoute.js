const express = require('express');
const { registerBusiness, fetchAllBusinesses, fetchBusinessById } = require('../controllers/businessController');

const router = express.Router();
const upload = require("../utils/multer");

router.post("/register",
  upload.fields([
    { name: "license_img", maxCount: 1 },
    { name: "citizenship_front_img", maxCount: 1 },
    { name: "citizenship_back_img", maxCount: 1 }
  ]), registerBusiness
);

router.get('/', fetchAllBusinesses);
router.get('/:business_id', fetchBusinessById);

module.exports = router;