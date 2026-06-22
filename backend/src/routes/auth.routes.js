const express = require('express');
const { login, register, getMe, logout, contactAdmin, forgotPassword } = require('../controllers/auth.controller');
const { loginValidator, registerValidator } = require('../validators/auth.validator');
const { validate } = require('../middlewares/validation.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.post('/login', loginValidator, validate, login);
router.post('/register', protect, authorize(ROLES.ADMIN), registerValidator, validate, register);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/contact', contactAdmin);
router.post('/forgot-password', forgotPassword);

module.exports = router;
