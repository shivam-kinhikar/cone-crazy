const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    offerName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ['Percentage', 'Flat', 'BOGO', 'Combo'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
