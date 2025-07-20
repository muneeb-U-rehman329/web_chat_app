const express = require('express');
const router = express.Router();
const {
  addChat,
  ChatList: getChats,
  deleteChatById,
  deleteAllChatsForUser,
} = require('../controllers/ChatList');
const { protect } = require('../middlewares/auth');

router.post('/add-chat', protect, addChat);
router.get('/get-chats', protect, getChats);
router.delete('/delete-chat/:chatId', protect, deleteChatById);
router.delete('/delete-all-chats', protect, deleteAllChatsForUser);

module.exports = router;