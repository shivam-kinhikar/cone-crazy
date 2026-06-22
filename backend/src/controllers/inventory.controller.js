const inventoryService = require('../services/inventory.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const createItem = async (req, res, next) => {
  try {
    const item = await inventoryService.createItem(req.body);
    return successResponse(res, STATUS_CODES.CREATED, 'Inventory item created successfully', item);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getItems = async (req, res, next) => {
  try {
    const items = await inventoryService.getItems(req.query);
    return successResponse(res, STATUS_CODES.OK, 'Inventory items retrieved', items);
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await inventoryService.getItemById(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Item retrieved', item);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.NOT_FOUND, error.message);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await inventoryService.updateItem(req.params.id, req.body);
    return successResponse(res, STATUS_CODES.OK, 'Item updated successfully', item);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await inventoryService.deleteItem(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Item deleted successfully');
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const stockIn = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const item = await inventoryService.adjustStock(req.params.id, amount, true);
    return successResponse(res, STATUS_CODES.OK, 'Stock added successfully', item);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const stockOut = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const item = await inventoryService.adjustStock(req.params.id, amount, false);
    return successResponse(res, STATUS_CODES.OK, 'Stock removed successfully', item);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getLowStockItems = async (req, res, next) => {
  try {
    const items = await inventoryService.getLowStockItems();
    return successResponse(res, STATUS_CODES.OK, 'Low stock items retrieved', items);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem, getItems, getItemById, updateItem, deleteItem, stockIn, stockOut, getLowStockItems
};
