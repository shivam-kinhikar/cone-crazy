const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize(ROLES.ADMIN), updateSettings);

module.exports = router;
