const { check } = require('express-validator');

const orderValidator = [
  check('items', 'Items array is required and must not be empty').isArray({ min: 1 }),
  check('items.*.productId', 'Valid Product ID is required').isMongoId(),
  check('items.*.productName', 'Product name is required').notEmpty(),
  check('items.*.quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
  check('items.*.unitPrice', 'Unit price must be positive').isFloat({ min: 0 }),
  check('paymentMethod', 'Invalid payment method').isIn(['Cash', 'UPI', 'Card']),
];

module.exports = { orderValidator };
