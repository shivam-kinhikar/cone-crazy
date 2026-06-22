const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Inventory = require('./src/models/Inventory');

const clearInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Inventory.deleteMany({});
    console.log("All dummy inventory data deleted.");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing inventory:", error);
    process.exit(1);
  }
};

clearInventory();
