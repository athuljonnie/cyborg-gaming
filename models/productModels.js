const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    unique: true,
  },
  productBrand: {
    type: String,
    required: true,
    
  },
  productPrice: {
    type: Number,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productImage: {
    type: Array,     
  },
  isBlocked:
  {
    type: Boolean,
    default: false
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
 
  productStatus: {
    type: Boolean,
    default: true,
  },
  productQuantity: {
    type: Number,
  },

  originalPrice:{
    type:Number,
    default:0
  },
  listed:{
    type: Boolean,
    default: false
  },
});


const Product = mongoose.model('Product', productSchema )

module.exports = Product;
