const express = require('express');
const { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/', protect, getCategories);
router.get('/:id', protect, getCategoryById);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), createCategory);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), updateCategory);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCategory);

module.exports = router;
