const reportService = require('../services/report.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await reportService.getSalesReport(startDate, endDate);
    return successResponse(res, STATUS_CODES.OK, 'Sales report generated', report);
  } catch (error) {
    next(error);
  }
};

const getInventoryReport = async (req, res, next) => {
  try {
    const report = await reportService.getInventoryReport();
    return successResponse(res, STATUS_CODES.OK, 'Inventory report generated', report);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSalesReport, getInventoryReport };
