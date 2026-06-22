const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, STATUS_CODES.UNAUTHORIZED, 'Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return errorResponse(res, STATUS_CODES.UNAUTHORIZED, 'User no longer exists');
    }
    next();
  } catch (err) {
    return errorResponse(res, STATUS_CODES.UNAUTHORIZED, 'Not authorized to access this route');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        STATUS_CODES.FORBIDDEN,
        `User role ${req.user ? req.user.role : 'undefined'} is not authorized to access this route`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
