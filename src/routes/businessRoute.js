const express = require("express");
const { register, fetchBusiness, updateBusinessStatus, getBusinessById, deleteBusiness, updateBusinessProfile, getMyBusiness } = require("../controllers/businessController");
const upload = require("../utils/multer")
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.post(
  "/create", upload.fields([
    { name: "license_img", maxCount: 1 },
    { name: "citizenship_front", maxCount: 1 },
    { name: "citizenship_back", maxCount: 1 }
  ]), register
);

router.get("/my-business", authMiddleware, getMyBusiness);
router.get("/", authMiddleware, checkPermission("verify_business_registration", "PLATFORM"), fetchBusiness);
router.patch("/:id", authMiddleware, checkPermission("verify_business_registration", "PLATFORM"), updateBusinessStatus);
router.put(
  "/update-profile",
  authMiddleware,
  upload.fields([
    { name: "license_img", maxCount: 1 },
    { name: "citizenship_front", maxCount: 1 },
    { name: "citizenship_back", maxCount: 1 }
  ]),
  updateBusinessProfile
);
router.get("/:id", authMiddleware, getBusinessById);
router.delete("/:id", authMiddleware, checkPermission("manage_platform", "PLATFORM"), deleteBusiness);


module.exports = router;