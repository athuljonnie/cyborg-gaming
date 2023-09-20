let User = require('../models/userModel');
let Product = require('../models/productModels');
let Category = require('../models/categoryModels');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');

module.exports = {
  getOrders: async (req, res) => {
    try {
      const userOrders = await Order.find().populate({path:"userId"})
      userOrders.forEach((order) => {
        if (order.userId) {
          console.log(order.userId.username);
        } else {
          console.log('userId is not populated for order', order._id);
        }
      });
      res.render("admin/orderspage", { userOrders, adminLayout: true });
      userOrders.forEach((order) => {});
    } catch (error) {
      throw new Error(error);
    }
  },

  updateOrderStatus: async (req, res) => {
    const orderId = req.params.orderId;
    const newStatus = req.body.deliverystatus;
    console.log(orderId);
    try {
      // Update the deliverystatus in the database
      await Order.updateOne(
        { _id: orderId },
        { $set: { deliverystatus: newStatus } }
      );

      res.redirect("http://localhost:4000/admin");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating deliverystatus");
    }
  },

  getOrderDetails: async (req, res) => {
    const orderId = req.query.orderId;
    const orderData = await Order.findById(orderId).populate({path: "userId"});
    console.log(orderData);
    res.render("admin/orderdetails", { orderData , adminLayout: true});
  },
};