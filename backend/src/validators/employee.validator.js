const { check } = require('express-validator');

const employeeValidator = [
  check('userId', 'Valid User ID is required').isMongoId(),
  check('salary', 'Salary must be a positive number').isFloat({ min: 0 }),
  check('shift', 'Invalid shift').isIn(['Morning', 'Evening', 'Night']),
  check('dateOfJoining', 'Date of joining is required').isISO8601(),
];

module.exports = { employeeValidator };
