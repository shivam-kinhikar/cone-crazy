require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const { ROLES } = require('./src/constants');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    const adminEmail = 'admin@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin user already exists.');
    } else {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: '123456', // According to the PDF requirements
        role: ROLES.ADMIN,
        phone: '0000000000',
      });
      console.log('Admin user created successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
