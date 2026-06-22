const Offer = require('../models/Offer');

const createOffer = async (data) => {
  return await Offer.create(data);
};

const getOffers = async () => {
  return await Offer.find().sort({ createdAt: -1 });
};

const getOfferById = async (id) => {
  const offer = await Offer.findById(id);
  if (!offer) throw new Error('Offer not found');
  return offer;
};

const updateOffer = async (id, data) => {
  const offer = await Offer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!offer) throw new Error('Offer not found');
  return offer;
};

const deleteOffer = async (id) => {
  const offer = await Offer.findByIdAndDelete(id);
  if (!offer) throw new Error('Offer not found');
  return offer;
};

module.exports = { createOffer, getOffers, getOfferById, updateOffer, deleteOffer };
