const categoryService = require('../services/category.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return successResponse(res, STATUS_CODES.CREATED, 'Category created successfully', category);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    return successResponse(res, STATUS_CODES.OK, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Category retrieved successfully', category);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.NOT_FOUND, error.message);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return successResponse(res, STATUS_CODES.OK, 'Category updated successfully', category);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Category deleted successfully');
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
