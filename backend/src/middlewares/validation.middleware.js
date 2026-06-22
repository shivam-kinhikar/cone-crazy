const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, 'Validation Error', errors.array());
  }
  next();
};

module.exports = { validate };
