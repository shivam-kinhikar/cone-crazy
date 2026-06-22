const customerService = require('../services/customer.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return successResponse(res, STATUS_CODES.CREATED, 'Customer created successfully', customer);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getCustomers(req.query);
    return successResponse(res, STATUS_CODES.OK, 'Customers retrieved successfully', customers);
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Customer retrieved', customer);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.NOT_FOUND, error.message);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return successResponse(res, STATUS_CODES.OK, 'Customer updated successfully', customer);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Customer deleted successfully');
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getCustomerOrderHistory = async (req, res, next) => {
  try {
    const orders = await customerService.getCustomerOrderHistory(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Customer order history retrieved', orders);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.NOT_FOUND, error.message);
  }
};

const getCustomerAnalytics = async (req, res, next) => {
  try {
    const analytics = await customerService.getCustomerAnalytics(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Customer analytics retrieved', analytics);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.NOT_FOUND, error.message);
  }
};

module.exports = {
  createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer, getCustomerOrderHistory, getCustomerAnalytics
};
