const express = require('express');
const { createOffer, getOffers, getOfferById, updateOffer, deleteOffer } = require('../controllers/offer.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants');
const { validate } = require('../middlewares/validation.middleware');
const { offerValidator } = require('../validators/offer.validator');

const router = express.Router();

router.use(protect);

router.get('/', getOffers);
router.get('/:id', getOfferById);

// Only Admins and Managers can manage offers
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

router.post('/', offerValidator, validate, createOffer);
router.put('/:id', offerValidator, validate, updateOffer);
router.delete('/:id', deleteOffer);

module.exports = router;
