const express = require('express');
const { getSalesReport, getInventoryReport } = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);

module.exports = router;
