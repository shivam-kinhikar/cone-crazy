const { check } = require('express-validator');

const offerValidator = [
  check('offerName', 'Offer name is required').notEmpty(),
  check('discountType', 'Invalid discount type').isIn(['Percentage', 'Flat', 'BOGO', 'Combo']),
  check('discountValue', 'Discount value must be a positive number').isFloat({ min: 0 }),
  check('startDate', 'Start date is required').isISO8601(),
  check('endDate', 'End date is required').isISO8601(),
];

module.exports = { offerValidator };
