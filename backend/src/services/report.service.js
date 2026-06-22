const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

const getSalesReport = async (startDate, endDate) => {
  const filter = {};
  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else {
    // Default to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filter.createdAt = { $gte: thirtyDaysAgo };
  }
  
  // Only completed orders
  filter.orderStatus = 'Completed';
  
  const orders = await Order.find(filter);
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  
  return {
    period: { startDate, endDate },
    totalOrders,
    totalRevenue,
    orders
  };
};

const getInventoryReport = async () => {
  const products = await Product.find({}, 'name stock price categoryId').populate('categoryId', 'name');
  const inventoryMaterials = await Inventory.find({}, 'itemName quantity minimumQuantity unit');
  
  const lowStockProducts = products.filter(p => p.stock < 10);
  const lowStockMaterials = inventoryMaterials.filter(m => m.quantity <= m.minimumQuantity);
  
  return {
    productsCount: products.length,
    materialsCount: inventoryMaterials.length,
    lowStockProducts,
    lowStockMaterials
  };
};

module.exports = { getSalesReport, getInventoryReport };
