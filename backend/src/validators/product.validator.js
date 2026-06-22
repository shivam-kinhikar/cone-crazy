const { check } = require('express-validator');

const productValidator = [
  check('name', 'Product name is required').notEmpty(),
  check('categoryId', 'Valid Category ID is required').isMongoId(),
  check('price', 'Price must be a positive number').isFloat({ min: 0.01 }),
  check('stock', 'Stock must be a non-negative integer').optional().isInt({ min: 0 }),
];

module.exports = { productValidator };
