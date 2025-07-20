require('dotenv').config();
const { StatusCodes } = require('http-status-codes');
const UserSchema = require('../models/user');
const axios = require('axios');
const errorHandler = require('../utills/errorHandler');
const CustomError = require('../errors/customError');
const User = require('../models/user');
const Chat = require('../models/chat');
const Message = require('../models/message');
const ChatListModel = require('../models/chatList');



const ChatList = errorHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch user and chats in parallel
  const [user, chats] = await Promise.all([
    User.findById(userId).select('name email'),
    Chat.aggregate([
      { $match: { participants: userId } },
      { $unwind: "$participants" },
      { $match: { participants: { $ne: userId } } },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participant"
        }
      },
      { $unwind: "$participant" },
      {
        $lookup: {
          from: "messages",
          let: { chatId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$chatId", "$$chatId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: "lastMessage"
        }
      },
      { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          chatId: "$_id",
          user: {
            _id: "$participant._id",
            name: "$participant.name",
            email: "$participant.email",
            avatar: "$participant.avatar"
          },
          lastMessage: "$lastMessage.text",
          lastMessageTime: "$lastMessage.createdAt",
          unreadCount: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$unreadMessages",
                      as: "msg",
                      cond: { $eq: ["$$msg.user", userId] }
                    }
                  },
                  0
                ]
              },
              { count: 0 }
            ]
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ])
  ]);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'User not found',
    });
  }

  // Format response
  const response = {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    chats: chats.map(chat => ({
      ...chat,
      unreadCount: chat.unreadCount.count
    }))
  };

  res.status(200).json(response);
});


const addChat = errorHandler(async (req, res) => {
  const { toEmail } = req.body;
  const fromId = req.user._id;

  if (!fromId || !toEmail) {
    throw new CustomError('Missing required fields', StatusCodes.BAD_REQUEST);
  }

  const fromUser = await User.findById(fromId);
  const toUser = await User.findOne({ email: toEmail.toLowerCase() });

  if (!fromUser || !toUser) {
    throw new CustomError('Invalid users', StatusCodes.NOT_FOUND);
  }

  if (fromUser._id.equals(toUser._id)) {
    throw new CustomError(
      "You can't chat with yourself",
      StatusCodes.BAD_REQUEST
    );
  }

  let chat = await Chat.findOne({
    participants: { $all: [fromUser._id, toUser._id], $size: 2 },
  });

  if (!chat) {
    chat = await Chat.create({ participants: [fromUser._id, toUser._id] });
  }

  const entries = [
    {
      userId: fromUser._id,
      chatId: chat._id,
      participant: {
        _id: toUser._id,
        name: toUser.name,
        username: toUser.username,
        avatar: toUser.avatar,
      },
    },
    {
      userId: toUser._id,
      chatId: chat._id,
      participant: {
        _id: fromUser._id,
        name: fromUser.name,
        username: fromUser.username,
        avatar: fromUser.avatar,
      },
    },
  ];

  await Promise.all(
    entries.map((entry) =>
      ChatListModel.updateOne(
        { userId: entry.userId, chatId: entry.chatId },
        { $setOnInsert: entry },
        { upsert: true }
      )
    )
  );

  const now = new Date();

  io.to(fromUser._id.toString()).emit('chat_created', {
    chatId: chat._id,
    user: entries[0].participant,
    lastMessage: '',
    lastMessageTime: now,
    unreadCount: 0,
  });

  io.to(toUser._id.toString()).emit('chat_created', {
    chatId: chat._id,
    user: entries[1].participant,
    lastMessage: '',
    lastMessageTime: now,
    unreadCount: 0,
  });

  res.status(StatusCodes.CREATED).json({
    message: 'Chat created',
    chatId: chat._id,
    user: {
      _id: toUser._id,
      name: toUser.name,
      username: toUser.username,
      email: toUser.email,
    },
  });
});


const deleteChatById = errorHandler(async (req, res) => {
  const userId = req.user._id;
  const { chatId } = req.params;

  await ChatListModel.deleteOne({ userId, chatId });

  const remaining = await ChatListModel.find({ chatId });
  if (remaining.length === 0) {
    await Chat.deleteOne({ _id: chatId });
    await Message.deleteMany({ chatId });
  }

  res.status(StatusCodes.OK).json({ message: 'Chat deleted', chatId });
});

const deleteAllChatsForUser = errorHandler(async (req, res) => {
  const userId = req.user._id;

  const entries = await ChatListModel.find({ userId });
  const chatIds = entries.map((e) => e.chatId);

  await ChatListModel.deleteMany({ userId });

  for (const chatId of chatIds) {
    const remaining = await ChatListModel.find({ chatId });
    if (remaining.length === 0) {
      await Chat.deleteOne({ _id: chatId });
      await Message.deleteMany({ chatId });
    }
  }

  res.status(StatusCodes.OK).json({
    message: 'All chats deleted',
    deletedChats: chatIds,
  });
});

module.exports = {
  ChatList,
  addChat,
  deleteChatById,
  deleteAllChatsForUser,
};
