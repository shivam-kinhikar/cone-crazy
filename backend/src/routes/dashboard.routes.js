const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.get('/stats', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), getDashboardStats);

module.exports = router;
