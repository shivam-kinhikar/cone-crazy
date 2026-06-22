const { STATUS_CODES } = require('../constants');

const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = {
  errorMiddleware,
};
