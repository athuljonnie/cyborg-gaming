const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
    required: true,
  },
  CategoryDescription: {
    type: String,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
  offerApplied: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type:Boolean,
    default: false,
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
