const express = require('express');
const { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer, getCustomerOrderHistory, getCustomerAnalytics } = require('../controllers/customer.controller');
const { customerValidator } = require('../validators/customer.validator');
const { validate } = require('../middlewares/validation.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), getCustomers);
router.get('/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), getCustomerById);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), customerValidator, validate, createCustomer);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), customerValidator, validate, updateCustomer);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCustomer);

router.get('/:id/orders', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), getCustomerOrderHistory);
router.get('/:id/analytics', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), getCustomerAnalytics);

module.exports = router;
