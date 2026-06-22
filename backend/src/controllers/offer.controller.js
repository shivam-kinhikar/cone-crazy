const offerService = require('../services/offer.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const createOffer = async (req, res, next) => {
  try {
    const offer = await offerService.createOffer(req.body);
    return successResponse(res, STATUS_CODES.CREATED, 'Offer created successfully', offer);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getOffers = async (req, res, next) => {
  try {
    const offers = await offerService.getOffers();
    return successResponse(res, STATUS_CODES.OK, 'Offers retrieved successfully', offers);
  } catch (error) {
    next(error);
  }
};

const getOfferById = async (req, res, next) => {
  try {
    const offer = await offerService.getOfferById(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Offer retrieved successfully', offer);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.NOT_FOUND, error.message);
  }
};

const updateOffer = async (req, res, next) => {
  try {
    const offer = await offerService.updateOffer(req.params.id, req.body);
    return successResponse(res, STATUS_CODES.OK, 'Offer updated successfully', offer);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const deleteOffer = async (req, res, next) => {
  try {
    await offerService.deleteOffer(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Offer deleted successfully');
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

module.exports = { createOffer, getOffers, getOfferById, updateOffer, deleteOffer };
