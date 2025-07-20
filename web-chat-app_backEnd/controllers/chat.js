const mongoose = require('mongoose');
const Chat = require('../models/chat');
const Message = require('../models/message');
const ChatList = require('../models/chatList');
const errorHandler = require('../utills/errorHandler');
const CustomError = require('../errors/customError');
const buildAvatarUrl = require('../utills/buildAvatarUrl');
const { StatusCodes } = require('http-status-codes');



const sendMessage = errorHandler(async (req, res) => {
  const senderId = req.user?._id;
  const { text, chatId } = req.body;
  const image = req.file;

  console.log('sendMessage: Request body:', req.body);
  console.log('sendMessage: Image file:', image);

  if (!senderId || !chatId) {
    throw new CustomError('Sender and chat ID are required.', StatusCodes.BAD_REQUEST);
  }

  const chat = await Chat.findById(chatId);
  if (!chat) throw new CustomError('Chat not found.', StatusCodes.NOT_FOUND);

  const isParticipant = chat.participants.some(
    (id) => id.toString() === senderId.toString()
  );
  if (!isParticipant) throw new CustomError('Not authorized.', StatusCodes.FORBIDDEN);

  const finalReceiverId = chat.participants.find(
    (id) => id.toString() !== senderId.toString()
  );

  const imagePath = image ? `/Uploads/${image.filename}` : null;
  console.log('sendMessage: Image path:', imagePath);

  // Modified this part to not set default "Image" text
  const messageText = text?.trim() || '';
  if (!messageText && !imagePath) {
    throw new CustomError('Message text or image is required.', StatusCodes.BAD_REQUEST);
  }

  const message = await Message.create({
    chatId: chat._id,
    sender: senderId,
    text: messageText, // This will be empty if no text was provided
    image: imagePath,
    readBy: [senderId],
  });

  console.log('sendMessage: Created message:', {
    _id: message._id,
    image: message.image,
  });

  const now = new Date();
  // Modified lastMessage to handle image-only case
  const lastMessage = messageText || (imagePath ? 'Image' : '');

  const updatedChat = await Chat.findByIdAndUpdate(
    chat._id,
    { lastMessage, lastMessageTime: now, $inc: { unreadCount: 1 } },
    { new: true }
  ).populate('participants', 'username name avatar');

  const receiver = updatedChat.participants.find(
    (p) => p._id.toString() !== senderId.toString()
  );
  const sender = updatedChat.participants.find(
    (p) => p._id.toString() === senderId.toString()
  );

  const formatParticipant = (user) => ({
    _id: user._id,
    name: user.name,
    username: user.username,
    avatar: buildAvatarUrl(req, user.avatar),
  });

  const chatListUpdateForReceiver = {
    chatId: chat._id,
    participant: formatParticipant(sender),
    lastMessage,
    lastMessageTime: now,
    unreadCount: 1,
  };

  const chatListUpdateForSender = {
    chatId: chat._id,
    participant: formatParticipant(receiver),
    lastMessage,
    lastMessageTime: now,
    unreadCount: 0,
  };

  await Promise.all([
    ChatList.findOneAndUpdate(
      { userId: senderId, chatId: chat._id },
      chatListUpdateForSender,
      { upsert: true, new: true }
    ),
    ChatList.findOneAndUpdate(
      { userId: finalReceiverId, chatId: chat._id },
      chatListUpdateForReceiver,
      { upsert: true, new: true }
    ),
  ]);

  const populatedMsg = await message.populate('sender', 'username avatar');
  console.log('sendMessage: Populated message:', {
    _id: populatedMsg._id,
    image: populatedMsg.image,
  });

  const imageUrl = populatedMsg.image ? buildAvatarUrl(req, populatedMsg.image) : null;
  console.log('sendMessage: Formatted image URL:', imageUrl);

  const formattedMsg = {
    _id: populatedMsg._id,
    text: populatedMsg.text, // This will be empty for image-only messages
    image: imageUrl,
    createdAt: populatedMsg.createdAt,
    sender: {
      _id: populatedMsg.sender._id,
      username: populatedMsg.sender.username,
      avatar: buildAvatarUrl(req, populatedMsg.sender.avatar),
    },
    isMine: true,
  };

  const io = global.io;
  io.to(senderId.toString()).emit('updateChatList', chatListUpdateForSender);
  io.to(finalReceiverId.toString()).emit('updateChatList', chatListUpdateForReceiver);
  io.to(chat._id.toString()).emit('newMessage', formattedMsg);

  res.status(StatusCodes.CREATED).json({
    message: 'Message sent successfully.',
    data: formattedMsg,
    chatListUpdate: chatListUpdateForSender,
  });
});

// GET MESSAGES
const getMessagesWithUser = errorHandler(async (req, res) => {
  const chatId = req.params.chatId?.toString();
  const myId = req.user._id.toString();

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: 'Invalid chat ID.' });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(200).json({ chatId: null, participants: [], messages: [] });
  }

  const isParticipant = chat.participants.some(
    (participant) => participant._id.toString() === myId
  );
  if (!isParticipant) {
    return res.status(403).json({ message: 'You are not part of this chat.' });
  }

  const messages = await Message.find({ chatId })
    .sort({ createdAt: 1 })
    .populate('sender', 'username avatar');

  const messagesWithMineFlag = messages.map((msg) => ({
    _id: msg._id,
    text: msg.text,
    image: msg.image ? buildAvatarUrl(req, msg.image) : null,
    createdAt: msg.createdAt,
    sender: {
      _id: msg.sender._id,
      username: msg.sender.username,
      avatar: buildAvatarUrl(req, msg.sender.avatar),
    },
    isMine: msg.sender._id.toString() === myId,
  }));

  await Message.updateMany(
    { chatId, sender: { $ne: myId }, readBy: { $ne: myId } },
    { $addToSet: { readBy: myId } }
  );

  res.status(200).json({
    chatId: chat._id,
    participants: chat.participants.map((p) => ({
      _id: p._id,
      username: p.username,
      avatar: buildAvatarUrl(req, p.avatar),
    })),
    messages: messagesWithMineFlag,
  });
});

module.exports = {
  sendMessage,
  getMessagesWithUser,
};
