const orderService = require('../services/order.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body, req.user._id);
    return successResponse(res, STATUS_CODES.CREATED, 'Order created successfully', order);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrders(req.query);
    return successResponse(res, STATUS_CODES.OK, 'Orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Order retrieved successfully', order);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.NOT_FOUND, error.message);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, orderStatus);
    return successResponse(res, STATUS_CODES.OK, 'Order status updated successfully', order);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const deleteAllOrders = async (req, res, next) => {
  try {
    await orderService.deleteAllOrders();
    return successResponse(res, STATUS_CODES.OK, 'All orders deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, deleteAllOrders };
