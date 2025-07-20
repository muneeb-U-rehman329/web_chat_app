const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');

const { getMessagesWithUser, sendMessage} = require('../controllers/chat');
const { protect } = require('../middlewares/auth');

router.get('/messages/:chatId', protect, getMessagesWithUser);
router.post('/send-message', upload.single('image'), protect, sendMessage);

module.exports = router;