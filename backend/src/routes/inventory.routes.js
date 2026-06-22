const express = require('express');
const { createItem, getItems, getItemById, updateItem, deleteItem, stockIn, stockOut, getLowStockItems } = require('../controllers/inventory.controller');
const { inventoryValidator, stockAdjustValidator } = require('../validators/inventory.validator');
const { validate } = require('../middlewares/validation.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/low-stock', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF), getLowStockItems);

router.get('/', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF, ROLES.CASHIER), getItems);
router.get('/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF, ROLES.CASHIER), getItemById);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF), inventoryValidator, validate, createItem);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF), inventoryValidator, validate, updateItem);
router.delete('/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), deleteItem);

router.patch('/stock-in/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF), stockAdjustValidator, validate, stockIn);
router.patch('/stock-out/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_STAFF), stockAdjustValidator, validate, stockOut);

module.exports = router;
