const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');
const { generateInvoice } = require('./invoice.service');

const createOrder = async (data, cashierId) => {
  // Generate unique order number (simple approach)
  const orderCount = await Order.countDocuments();
  const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;
  
  // Calculate totals and reduce stock
  let subtotal = 0;
  for (const item of data.items) {
    let product = await Product.findById(item.productId);
    let isInventory = false;
    
    if (!product) {
      product = await Inventory.findById(item.productId);
      isInventory = true;
    }
    
    if (!product) throw new Error(`Item not found: ${item.productId}`);
    
    const stockAvailable = isInventory ? product.quantity : product.stock;
    const name = isInventory ? product.itemName : product.name;
    const price = isInventory ? (product.sellingPrice || 0) : product.price;

    if (stockAvailable < item.quantity) {
      throw new Error(`Insufficient stock for: ${name}`);
    }
    
    // Deduct stock
    if (isInventory) {
      product.quantity -= item.quantity;
    } else {
      product.stock -= item.quantity;
    }
    await product.save();
    
    item.productName = name;
    item.unitPrice = price;
    item.totalPrice = price * item.quantity;
    subtotal += item.totalPrice;
  }
  
  const discountAmount = data.discountAmount || 0;
  const taxAmount = data.taxAmount || 0;
  const totalAmount = subtotal - discountAmount + taxAmount;
  
  const order = await Order.create({
    ...data,
    orderNumber,
    cashierId,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    offerId: data.offerId || undefined
  });
  
  // Update customer loyalty points and metrics if customer exists
  if (data.customerId) {
    const customer = await Customer.findById(data.customerId);
    if (customer) {
      // Award 10 loyalty points for every 100 Rs spent
      const pointsEarned = Math.floor(totalAmount / 100) * 10;
      
      customer.totalOrders += 1;
      customer.totalSpent += totalAmount;
      customer.loyaltyPoints += pointsEarned;
      
      await customer.save();
    }
  }

  // Generate invoice automatically as per PDF flow
  const invoice = await generateInvoice(order);
  order.invoiceId = invoice._id;
  await order.save();
  
  return order;
};

const getOrders = async (query = {}) => {
  const filter = {};
  if (query.customerId) filter.customerId = query.customerId;
  if (query.orderStatus) filter.orderStatus = query.orderStatus;
  
  return await Order.find(filter)
    .populate('customerId', 'name mobile')
    .sort({ createdAt: -1 });
};

const getOrderById = async (id) => {
  const order = await Order.findById(id).populate('customerId', 'name mobile').populate('cashierId', 'name');
  if (!order) throw new Error('Order not found');
  return order;
};

const updateOrderStatus = async (id, orderStatus) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Order not found');
  
  if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
    // Restore product stock
    for (const item of order.items) {
      let product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      } else {
        const invItem = await Inventory.findById(item.productId);
        if (invItem) {
          invItem.quantity += item.quantity;
          await invItem.save();
        }
      }
    }
  }
  
  order.orderStatus = orderStatus;
  await order.save();
  return order;
};

const deleteAllOrders = async () => {
  return await Order.deleteMany({});
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, deleteAllOrders };
