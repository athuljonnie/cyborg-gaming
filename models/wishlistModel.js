const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  products: [{
    prodId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    
    originalPrice:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    price: {
      type: Number,
      required: true
    },
    image: [{
      type: String
    }]
  }]
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;