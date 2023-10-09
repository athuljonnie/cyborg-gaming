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
  offer: {
    type: Boolean,
    default: false
  },
  catoffer: {
    type: Boolean,
    default: false
  },
  offerPrice: {
    type: Number,
    default: 0
  },
  catofferPrice: {
    type: Number,
    default: 0
  },
  offerPercentage:{
    type: Number,
    default: 0
  },
  catofferPercentage:{
    type: Number,
    default: 0
  },
  offerStart:{
    type:Date,
    default: null
  },
  offerEnd:{
    type:Date,
    default: null
  },
  catofferEnd:{
    type:Date,
    default: null
  },
  catofferStart:{
    type:Date,
    default: null
  },
  
});


const Product = mongoose.model('Product', productSchema )
productSchema.index({ productName: 'text' });
module.exports = Product;
