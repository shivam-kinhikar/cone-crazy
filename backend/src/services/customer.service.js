const Customer = require('../models/Customer');
// Need to require Order model when it is created for analytics/history
// const Order = require('../models/Order');

const createCustomer = async (data) => {
  return await Customer.create(data);
};

const getCustomers = async (query = {}) => {
  const filter = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { mobile: { $regex: query.search, $options: 'i' } }
    ];
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await Customer.countDocuments(filter);
  const customers = await Customer.find(filter)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  return { total, page, limit, totalPages: Math.ceil(total / limit), data: customers };
};

const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw new Error('Customer not found');
  return customer;
};

const updateCustomer = async (id, data) => {
  const customer = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!customer) throw new Error('Customer not found');
  return customer;
};

const deleteCustomer = async (id) => {
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) throw new Error('Customer not found');
  return customer;
};

const getCustomerOrderHistory = async (id) => {
  // Placeholder for when Phase 5 Orders is done
  // const orders = await Order.find({ customerId: id }).sort({ createdAt: -1 });
  // return orders;
  return []; 
};

const getCustomerAnalytics = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw new Error('Customer not found');
  
  return {
    totalOrders: customer.totalOrders,
    totalSpent: customer.totalSpent,
    loyaltyPoints: customer.loyaltyPoints,
  };
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerOrderHistory,
  getCustomerAnalytics
};
