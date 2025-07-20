// notFoundError.js
const CustomError = require('./customError');
const { StatusCodes } = require('http-status-codes');

class NotFoundError extends CustomError {
  constructor(message) {
    super(message, StatusCodes.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;