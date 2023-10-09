const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true
  },
  active:{
    type:Boolean,
    default: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  priceRange:{
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
