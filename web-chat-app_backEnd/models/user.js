const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const generateAccountId = () => crypto.randomBytes(5).toString('hex');

const userSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      unique: true,
      default: generateAccountId,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      match: [
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
        'Password must contain at least one special character.',
      ],
      minlength: 8,
    },
    date: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    lastFailedOtpAttempt: {
      type: Date,
      default: null,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    failedOtpAttempts: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default:
        'https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
    },
    verificationPin: {
      type: String,
    },
    pinExpiry: {
      type: Date,
    },
    fcmToken: {
      type: String,
    },
    chats: [
      {
        chatId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Chat',
        },
        lastMessage: {
          type: String,
        },
        unreadCount: {
          type: Number,
          default: 0,
        },
        lastSeen: {
          type: Date,
        },
      },
    ],
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  try {
    this.updatedAt = Date.now();
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.otpExpiry;
  return user;
};



module.exports = mongoose.model('User', userSchema);
