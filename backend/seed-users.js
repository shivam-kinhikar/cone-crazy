require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const { ROLES } = require('./src/constants');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = [
      { name: 'Manager User', email: 'manager@gmail.com', password: 'password123', role: ROLES.MANAGER, phone: '1111111111' },
      { name: 'Cashier User', email: 'cashier@gmail.com', password: 'password123', role: ROLES.CASHIER, phone: '2222222222' },
      { name: 'Inventory Staff', email: 'inventory@gmail.com', password: 'password123', role: ROLES.INVENTORY_STAFF, phone: '3333333333' }
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`Created ${u.role}: ${u.email}`);
      } else {
        console.log(`${u.role} already exists: ${u.email}`);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
seedUsers();
