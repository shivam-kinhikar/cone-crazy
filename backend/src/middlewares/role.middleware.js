const { errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, STATUS_CODES.FORBIDDEN, `User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

module.exports = { authorize };
