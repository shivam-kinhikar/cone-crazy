const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid credentials');
  }
  if (user.status !== 'active') {
    throw new Error('User account is inactive');
  }
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.role);
  return { jwt_token: token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } };
};

const registerUser = async (userData) => {
  const userExists = await User.findOne({ email: userData.email });
  if (userExists) {
    throw new Error('Email already registered');
  }
  const user = await User.create(userData);
  return { _id: user._id, name: user.name, email: user.email, role: user.role };
};

module.exports = {
  loginUser,
  registerUser
};
