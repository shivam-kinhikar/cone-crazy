const express = require('express');
const { getInvoices, getInvoiceById, downloadInvoice } = require('../controllers/invoice.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), getInvoices);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), getInvoiceById);
router.get('/:id/download', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), downloadInvoice);

module.exports = router;
