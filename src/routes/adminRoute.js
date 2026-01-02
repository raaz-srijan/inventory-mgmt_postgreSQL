const express = require('express');
const { fetchUnverifiedBusinesses, fetchUnverifiedBusinessById, approveBusiness, deleteBusiness } = require('../controllers/adminController');
const router = express.Router();

router.get('/unverified', fetchUnverifiedBusinesses);
router.get('/unverified/:business_id', fetchUnverifiedBusinessById);
router.patch("/approve/:business_id", approveBusiness);
router.delete('/delete-business', deleteBusiness);

module.exports=router;