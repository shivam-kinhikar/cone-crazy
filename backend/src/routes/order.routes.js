const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrderStatus, deleteAllOrders } = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');
const { validate } = require('../middlewares/validation.middleware');
const { orderValidator } = require('../validators/order.validator');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), orderValidator, validate, createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), updateOrderStatus);
router.delete('/', authorize(ROLES.ADMIN), deleteAllOrders);

module.exports = router;
