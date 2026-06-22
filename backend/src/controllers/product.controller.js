const productService = require('../services/product.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body, createdBy: req.user._id };
    const product = await productService.createProduct(productData);
    return successResponse(res, STATUS_CODES.CREATED, 'Product created successfully', product);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts(req.query);
    return successResponse(res, STATUS_CODES.OK, 'Products retrieved successfully', products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Product retrieved successfully', product);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.NOT_FOUND, error.message);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return successResponse(res, STATUS_CODES.OK, 'Product updated successfully', product);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Product deleted successfully');
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const product = await productService.updateProductStatus(req.params.id, status);
    return successResponse(res, STATUS_CODES.OK, 'Product status updated successfully', product);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, updateProductStatus };
