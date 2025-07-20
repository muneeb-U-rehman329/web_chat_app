// authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors/customError');
const User = require('../models/user');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new CustomError('No token provided', StatusCodes.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded?.id);
    
    if (!user) {
      throw new CustomError('User not found', StatusCodes.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (err) {
    next(
      new CustomError(
        `Authentication failed: ${err.message}`,
        StatusCodes.UNAUTHORIZED
      )
    );
  }
};

module.exports = { protect };
