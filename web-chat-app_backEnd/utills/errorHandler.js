const { StatusCodes } = require('http-status-codes');

const errorHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 'false',
        message: 'Validation error',
        errors: err.errors,
      });
    }

    return res
      .status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: 'false',
        message: err.message || 'An error occurred',
      });
  }
};

module.exports = errorHandler;