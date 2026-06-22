const Notification = require('../models/Notification');

const createNotification = async (title, message, type) => {
  return await Notification.create({ title, message, type });
};

const getNotifications = async (unreadOnly = false) => {
  const filter = unreadOnly === 'true' || unreadOnly === true ? { readStatus: false } : {};
  return await Notification.find(filter).sort({ createdAt: -1 });
};

const markAsRead = async (id) => {
  const notification = await Notification.findById(id);
  if (!notification) throw new Error('Notification not found');
  
  notification.readStatus = true;
  await notification.save();
  return notification;
};

const clearAllNotifications = async () => {
  return await Notification.deleteMany({});
};

module.exports = { createNotification, getNotifications, markAsRead, clearAllNotifications };
