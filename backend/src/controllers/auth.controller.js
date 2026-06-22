const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');
const Notification = require('../models/Notification');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    // Destructuring to match PDF response format requirement
    return res.status(STATUS_CODES.OK).json({ success: true, token: result.jwt_token, user: result.user });
  } catch (error) {
    return errorResponse(res, STATUS_CODES.UNAUTHORIZED, error.message);
  }
};

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return successResponse(res, STATUS_CODES.CREATED, 'User registered successfully', result);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const getMe = async (req, res, next) => {
  try {
    return successResponse(res, STATUS_CODES.OK, 'User details retrieved', req.user);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    return successResponse(res, STATUS_CODES.OK, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const contactAdmin = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    
    // Create a new notification for the admin
    await Notification.create({
      title: 'New Account Request',
      message: `Name: ${name}\nEmail: ${email}\nMessage: ${message || 'No message provided.'}`,
      type: 'System'
    });

    return successResponse(res, STATUS_CODES.CREATED, 'Message sent successfully');
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Simulate sending a reset email by creating a system notification for the admin
    await Notification.create({
      title: 'Password Reset Request',
      message: `A password reset was requested for the account: ${email}. Since email services are not configured, please reset the password manually if needed.`,
      type: 'System'
    });

    // Always return success to prevent email enumeration attacks
    return successResponse(res, STATUS_CODES.OK, 'If an account exists with that email, a password reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  logout,
  contactAdmin,
  forgotPassword
};
