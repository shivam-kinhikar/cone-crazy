const express = require('express');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, updateProductStatus } = require('../controllers/product.controller');
const { productValidator } = require('../validators/product.validator');
const { validate } = require('../middlewares/validation.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), productValidator, validate, createProduct);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), productValidator, validate, updateProduct);
router.patch('/status/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), updateProductStatus);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteProduct);

module.exports = router;
