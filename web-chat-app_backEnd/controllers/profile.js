const { StatusCodes } = require('http-status-codes');
const errorHandler = require('../utills/errorHandler');
const CustomError = require('../errors/customError');
const User = require('../models/user');
const Chat = require('../models/chat');

// Helper to build avatar URL
const buildAvatarUrl = (req, avatarPath) => {
  const defaultAvatar = 'https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg';
  if (!avatarPath) return defaultAvatar;
  return avatarPath.startsWith('http')
    ? avatarPath
    : `${req.protocol}://${req.get('host')}${avatarPath}`;
};

const getProfile = errorHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new CustomError('User not authenticated', StatusCodes.UNAUTHORIZED);
  }

  const fullUser = await User.findById(user._id).select(
    'avatar username name email bio createdAt updatedAt'
  );

  if (!fullUser) {
    throw new CustomError('User profile not found', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    profile: {
      _id: fullUser._id,
      avatar: buildAvatarUrl(req, fullUser.avatar),
      username: fullUser.username,
      name: fullUser.name,
      email: fullUser.email,
      bio: fullUser.bio || '',
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
    },
  });
});

const editProfile = errorHandler(async (req, res) => {
  const id = req.user._id;
  const { name, bio, email } = req.body;
  const avatar = req.file;

  const updates = {};
  if (name) updates.name = name;
  if (bio) updates.bio = bio;
  if (email) updates.email = email;
  if (avatar) updates.avatar = `/uploads/${avatar.filename}`;

  if (Object.keys(updates).length === 0) {
    throw new CustomError('No valid fields provided for update.', StatusCodes.BAD_REQUEST);
  }

  const updatedUser = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new CustomError('User not found.', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    profile: {
      _id: updatedUser._id,
      avatar: buildAvatarUrl(req, updatedUser.avatar),
      username: updatedUser.username,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio || '',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  });
});



const getReceiverProfile = errorHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const currentUserId = req.user._id;

  if (!chatId) {
    throw new CustomError('Chat ID is required.', StatusCodes.BAD_REQUEST);
  }

  const chat = await Chat.findById(chatId).select('participants');

  if (!chat || !chat.participants || chat.participants.length < 2) {
    throw new CustomError('Chat not found or invalid.', StatusCodes.NOT_FOUND);
  }

  const receiverId = chat.participants.find(
    (id) => id.toString() !== currentUserId.toString()
  );

  if (!receiverId) {
    throw new CustomError('Receiver not found in this chat.', StatusCodes.NOT_FOUND);
  }

  const receiver = await User.findById(receiverId).select(
    '_id avatar name username bio email createdAt updatedAt'
  );

  if (!receiver) {
    throw new CustomError('Receiver profile not found.', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    receiver: {
      _id: receiver._id,
      avatar: buildAvatarUrl(req, receiver.avatar),
      name: receiver.name,
      username: receiver.username,
      bio: receiver.bio || '',
      email: receiver.email,
      createdAt: receiver.createdAt,
      updatedAt: receiver.updatedAt,
    },
  });
});

module.exports = { getProfile, editProfile, getReceiverProfile };
