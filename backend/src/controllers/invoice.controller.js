const invoiceService = require('../services/invoice.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');
const path = require('path');
const fs = require('fs');

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await invoiceService.getInvoices();
    return successResponse(res, STATUS_CODES.OK, 'Invoices retrieved successfully', invoices);
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Invoice retrieved successfully', invoice);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.NOT_FOUND, error.message);
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    const pdfPath = path.join(__dirname, '../../public', invoice.pdfUrl);
    
    if (fs.existsSync(pdfPath)) {
      res.download(pdfPath);
    } else {
      return errorResponse(res, STATUS_CODES.NOT_FOUND, 'Invoice PDF not found on server');
    }
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

module.exports = { getInvoices, getInvoiceById, downloadInvoice };
