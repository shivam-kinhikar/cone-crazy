const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, required: true, default: 'Cone Crazy' },
    gstNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    invoicePrefix: { type: String, default: 'INV-' },
    taxPercentage: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
