const { check } = require('express-validator');

const customerValidator = [
  check('name', 'Name is required').notEmpty(),
  check('mobile', 'Valid mobile format is required').notEmpty(),
  check('email', 'Please provide a valid email').optional({ nullable: true, checkFalsy: true }).isEmail(),
];

module.exports = { customerValidator };
