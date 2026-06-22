const express = require('express');
const { getNotifications, markAsRead, clearAllNotifications } = require('../controllers/notification.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

router.get('/', getNotifications);
router.delete('/clear', clearAllNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;
