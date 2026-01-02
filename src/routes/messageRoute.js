const express = require('express');
const router = express.Router();
const { sendMessage, fetchMessages } = require('../controllers/messageController');

router.post('/', sendMessage);

router.get('/:user_id', fetchMessages);

module.exports = router;
