const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    totalAmount: {
    type: Number,
    default:0
    },
    offerPrice: {
      type: Number,
      default: 0
    },
    discountCode:{
      type:String
    },
    couponDiscount:{
      type:Number,
      default: 0
    },
    walletAmount:{
      type:Boolean,
      default: false
    },
    manageTotal:{
      type: Number
    },
    cartOffer: {
      type: Boolean,
      default: false
    }
  },


  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;