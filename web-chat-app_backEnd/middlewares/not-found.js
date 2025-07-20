const notFoundError = require('../errors/not-found');

const notFound = async (req, res, next )=>{
    next(new notFoundError(`Not Found - ${req.originalUrl}`));
}

module.exports = notFound;