const { check } = require('express-validator');

const loginValidator = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

const registerValidator = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('role', 'Valid role is required').optional().isIn(['admin', 'manager', 'cashier', 'inventory_staff']),
];

const changePasswordValidator = [
  check('currentPassword', 'Current password is required').exists(),
  check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 }),
];

module.exports = {
  loginValidator,
  registerValidator,
  changePasswordValidator
};
