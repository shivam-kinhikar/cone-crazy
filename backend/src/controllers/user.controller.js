const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    return successResponse(res, STATUS_CODES.OK, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, STATUS_CODES.NOT_FOUND, 'User not found');
    }
    // Prevent deleting self (Optional but good practice)
    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, 'You cannot delete your own account');
    }
    await User.findByIdAndDelete(req.params.id);
    return successResponse(res, STATUS_CODES.OK, 'User deleted successfully');
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, phone, status, password } = req.body;
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, STATUS_CODES.NOT_FOUND, 'User not found');
    }
    
    // Prevent changing own role or status (Optional but safe for Admin)
    if (user._id.toString() === req.user._id.toString() && (role !== user.role || status !== user.status)) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, 'You cannot change your own role or status');
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    user.status = status || user.status;
    
    if (password) {
      user.password = password;
    }
    
    await user.save();
    
    const updatedUser = await User.findById(user._id).select('-password');
    return successResponse(res, STATUS_CODES.OK, 'User updated successfully', updatedUser);
  } catch (error) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, error.message);
  }
};

module.exports = {
  getUsers,
  deleteUser,
  updateUser
};
