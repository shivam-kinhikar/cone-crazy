const express = require('express');
const { getUsers, deleteUser, updateUser } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

// Only Admins should be able to manage users
router.get('/', protect, authorize(ROLES.ADMIN), getUsers);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteUser);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateUser);

module.exports = router;
