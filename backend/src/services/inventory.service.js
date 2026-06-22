const Inventory = require('../models/Inventory');

const createItem = async (data) => {
  return await Inventory.create(data);
};

const getItems = async (query = {}) => {
  const filter = {};
  if (query.search) {
    filter.itemName = { $regex: query.search, $options: 'i' };
  }

  return await Inventory.find(filter).sort({ itemName: 1 });
};

const getItemById = async (id) => {
  const item = await Inventory.findById(id);
  if (!item) throw new Error('Inventory item not found');
  return item;
};

const updateItem = async (id, data) => {
  data.lastUpdated = Date.now();
  const item = await Inventory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw new Error('Inventory item not found');
  return item;
};

const deleteItem = async (id) => {
  const item = await Inventory.findByIdAndDelete(id);
  if (!item) throw new Error('Inventory item not found');
  return item;
};

const adjustStock = async (id, amount, isStockIn) => {
  const item = await Inventory.findById(id);
  if (!item) throw new Error('Inventory item not found');

  if (isStockIn) {
    item.quantity += amount;
  } else {
    if (item.quantity < amount) {
      throw new Error(`Insufficient stock. Current stock: ${item.quantity}`);
    }
    item.quantity -= amount;
  }

  item.lastUpdated = Date.now();
  await item.save();
  return item;
};

const getLowStockItems = async () => {
  // Using MongoDB aggregation to find items where quantity <= minimumQuantity
  return await Inventory.find({ $expr: { $lte: ['$quantity', '$minimumQuantity'] }, status: 'active' });
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  adjustStock,
  getLowStockItems
};
