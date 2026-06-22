const { check } = require('express-validator');

const inventoryValidator = [
  check('itemName', 'Item name is required').notEmpty(),
  check('quantity', 'Quantity is required and must be numeric').isNumeric(),
  check('unit', 'Unit is required').notEmpty(),
  check('minimumQuantity', 'Minimum quantity is required and must be numeric').isNumeric(),
  check('sellingPrice', 'Selling price must be numeric').optional().isNumeric(),
];

const stockAdjustValidator = [
  check('amount', 'Amount is required and must be numeric').isNumeric({ min: 0.01 }),
];

module.exports = { inventoryValidator, stockAdjustValidator };
