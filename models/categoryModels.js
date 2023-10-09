const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

  CategoryName: {
    type: String,
    unique: true,
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

  offer: {
    type: Boolean,
    default: false
  },

  catofferPercentage:{
    type: Number,
    default: 0
  },

  catofferStart:{
    type:Date,
    default: null
  },
  
  catofferEnd:{
    type:Date,
    default: null
  }
});

const Category = mongoose.model('Category', categorySchema);
categorySchema.index({ CategoryName: 'text' });
module.exports = Category;
