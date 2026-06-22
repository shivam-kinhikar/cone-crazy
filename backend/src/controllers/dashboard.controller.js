const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { successResponse } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

const Product = require('../models/Product');

const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Orders & Revenue
    const totals = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalOrders = totals.length > 0 ? totals[0].totalOrders : 0;
    const totalRevenue = totals.length > 0 ? totals[0].totalRevenue : 0;

    // 2. Delivered vs Outstanding Orders
    const orderStatuses = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    let deliveredOrders = 0;
    let outstandingOrders = 0;
    orderStatuses.forEach(status => {
      if (status._id === 'Completed') deliveredOrders += status.count;
      if (['Pending', 'Preparing', 'Ready'].includes(status._id)) outstandingOrders += status.count;
    });

    // 3. Dynamic Sales Chart Data
    const reqYear = req.query.year;
    const reqMonth = req.query.month;

    const year = reqYear === 'All' ? 'All' : (parseInt(reqYear) || new Date().getFullYear());
    const month = reqMonth === 'All' ? 'All' : parseInt(reqMonth);

    let matchStage = {};
    let groupId = null;
    let formatData = [];

    if (year === 'All') {
      // Group by Year
      groupId = { $year: '$createdAt' };
    } else if (month === 'All') {
      // Specific Year, All Months -> Group by Month
      matchStage = {
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`)
        }
      };
      groupId = { $month: '$createdAt' };
    } else {
      // Specific Year, Specific Month -> Group by Day
      const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
      matchStage = {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };
      groupId = { $dayOfMonth: '$createdAt' };
    }

    const pipeline = [
      { $group: { _id: groupId, total: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } }
    ];

    if (Object.keys(matchStage).length > 0) {
      pipeline.unshift({ $match: matchStage });
    }

    const aggregatedSales = await Order.aggregate(pipeline);

    if (year === 'All') {
      // Years from 2000 to Current
      const currentY = new Date().getFullYear();
      for (let y = 2000; y <= currentY; y++) {
        const found = aggregatedSales.find(a => a._id === y);
        formatData.push({ name: String(y), total: found ? found.total : 0 });
      }
    } else if (month === 'All') {
      // Months Jan-Dec
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      formatData = monthNames.map((name, index) => {
        const found = aggregatedSales.find(a => a._id === index + 1);
        return { name, total: found ? found.total : 0 };
      });
    } else {
      // Days 1 to EndOfMonth
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const found = aggregatedSales.find(a => a._id === d);
        formatData.push({ name: `Day ${d}`, total: found ? found.total : 0 });
      }
    }
    const chartData = formatData;

    // 4. Low Stock Items (Materials)
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minimumQuantity'] },
      status: 'active'
    }).limit(10);

    // 5. Low Stock Products (Ice Creams)
    const lowStockProducts = await Product.find({
      stock: { $lte: 5, $gt: 0 },
      status: 'active'
    }).limit(10);

    const data = {
      totalOrders,
      totalRevenue,
      deliveredOrders,
      outstandingOrders,
      chartData,
      lowStockItems,
      lowStockProducts
    };

    return successResponse(res, STATUS_CODES.OK, 'Dashboard stats retrieved', data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
