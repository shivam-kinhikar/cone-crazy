const notificationService = require('../services/notification.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const createNotification = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;
    const notification = await notificationService.createNotification(title, message, type);
    return successResponse(res, STATUS_CODES.CREATED, 'Notification created', notification);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(req.query.unreadOnly);
    return successResponse(res, STATUS_CODES.OK, 'Notifications retrieved', notifications);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'Notification marked as read', notification);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const clearAllNotifications = async (req, res, next) => {
  try {
    await notificationService.clearAllNotifications();
    return successResponse(res, STATUS_CODES.OK, 'All notifications cleared');
  } catch (error) {
    next(error);
  }
};

module.exports = { createNotification, getNotifications, markAsRead, clearAllNotifications };
