const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  deliveryDetails: {
    Fullname: { type: String, required: true },
    state: { type: String, required: true },
    house: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
  },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  paymentMethod: { type: String, required: true },
  products: [
    {
      name: {
        type: String,
        required: true,
      },

      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },

      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentstatus: {
    type: String,
  },
  deliverystatus: {
    type: String,
  },
  cancellationrequest: {
    type: Boolean,
    default: false,
  },
  returnrequest: {
    type: Boolean,
    default: false,
  },
  cancellationapproval: {
    type: Boolean,
    default: false,
  },
  returnapproval: {
    type: Boolean,
    default: false,
  },
  returnreason:{
  type: String
  },

  orderstatus: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
