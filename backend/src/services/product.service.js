const Product = require('../models/Product');

const createProduct = async (data) => {
  return await Product.create(data);
};

const getProducts = async (query = {}) => {
  // Simple search and filter
  const filter = {};
  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }
  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }
  
  // Pagination
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Sorting
  const sortOptions = {};
  if (query.sortBy) {
    const parts = query.sortBy.split(':');
    sortOptions[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1;
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('categoryId', 'name')
    .sort(sortOptions)
    .skip(startIndex)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: products
  };
};

const getProductById = async (id) => {
  const product = await Product.findById(id).populate('categoryId', 'name');
  if (!product) throw new Error('Product not found');
  return product;
};

const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!product) throw new Error('Product not found');
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new Error('Product not found');
  return product;
};

const updateProductStatus = async (id, status) => {
  const product = await Product.findByIdAndUpdate(id, { status }, { new: true });
  if (!product) throw new Error('Product not found');
  return product;
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus
};
