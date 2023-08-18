const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModels");
const Razorpay = require('razorpay');
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

module.exports = {
  getTotalPrice: async (req, res) => {
    const loggedInUserId = req.session.user;
    const totalAmount = req.query.totalAmount;
    console.log(totalAmount);
    try {
      let cart = await Cart.findOne({ user: loggedInUserId });
      if (cart) {
        cart.totalAmount = totalAmount;
        await cart.save();
      } else {
        console.log("Cart not found");
      }
    } catch (error) {
      console.log(error);
    }
    res.json({ success: true });
  },

  placeOrder: async (req, res) => {
    const loggedInUserId = req.session.user;
    const cart = await Cart.find({ user: loggedInUserId });
  },

  order: async (req, res) => {
    let { addressId, paymentMethod } = req.body;
    console.log(paymentMethod, "--payment method");
    let userId = req.session.user._id;
    let cart = await Cart.findOne({ user: userId }).populate({
      path: "products.productId",
      model: "Product",
    });
    const orderProducts = cart.products.map((product) => {
      return {
        name: product.productId.productName,
        quantity: product.quantity,
      };
    });
    let totalAmount = cart.totalAmount;

    try {
      const deliveryAddress = await Address.findOne({
        "addresses._id": addressId,
      });
      let selectedAddress;
      if (deliveryAddress && deliveryAddress.addresses.length > 0) {
        selectedAddress = deliveryAddress.addresses.find(
          (address) => address._id.toString() === addressId
        );

        let newOrder = new Order({
          deliveryDetails: {
            Fullname: selectedAddress.fullname,
            state: selectedAddress.state,
            house: selectedAddress.house,
            landmark: selectedAddress.landmark,
            city: selectedAddress.city,
            zip: selectedAddress.zip,
            number: selectedAddress.number,
            email: selectedAddress.email,
            type: selectedAddress.type,
          },
          userId: userId,
          paymentMethod: req.body["paymentMethod"],
          products: orderProducts,
          totalAmount: totalAmount,
          paymentstatus: "cod",
          deliverystatus: "pending",
        });
        await newOrder.save();

        let orderId = newOrder._id;
        let orderIdString = orderId.toString();

        if (["paymentMethod"] === "cod") {
          console.log("cod", ["paymentMethod"]);
        } 
        
        else if (["paymentMethod"] === "razorpay") {
          // console.log(newOrder._id,"razorpay"); 
          var options = {
            amount: newOrder.totalAmount * 100,
            currency: "INR",
            receipt: orderIdString,
          };

          // console.log(options);
          instance.orders.create(options, function (err, order) {
            if (err) {
              console.error(err);
              res.status(500).json({ error: "Error creating Razorpay order" });
            } else {
              res.json({ order: order, newOrder: newOrder, price: totalPrice }); // Send the order as a JSON response
            }
          });
        }
        await Cart.deleteOne({ user: userId });
        
      }
      res.json({ success: true });
    } catch (error) {
      console.log(error);
    }
  },

  verifyPayment: async (req, res) => {
    const loggedInUserId = req.session.user;
    console.log(req.body.price);
    const newOrder = {};
    for (const key in req.body) {
      if (key.startsWith('newOrder[')) {
        const nestedKeys = key.slice('newOrder['.length, -1).split('][');
        let currentObject = newOrder;
        for (let i = 0; i < nestedKeys.length - 1; i++) {
          if (!currentObject[nestedKeys[i]]) {
            currentObject[nestedKeys[i]] = {};
          }
          currentObject = currentObject[nestedKeys[i]];
        }
        currentObject[nestedKeys[nestedKeys.length - 1]] = req.body[key];
      }
    }
    console.log(newOrder, "--------------------------------------------------------------------------------------------");
    try {
      const cart = await Cart.findOne({ userId: loggedInUserId });
      const orderProducts = cart.products.map((product) => {
        const price = product.cartOffer === true ? product.offerPrice : product.price;
        return {
          name: product.productName,
          image: product.image[0],
          category: product.category,
          subcategory: product.subcategory,
          prodId: product.prodId,
          quantity: product.count,
          size: product.size,
          price: price,
          orderStatus: "",
          deliveryStatus: "",
        };
      });
      
  
      const newoder = new Order({
        deliveryDetails: {
          userName: newOrder.deliveryDetails.userName,
          state: newOrder.deliveryDetails.state,
          house: newOrder.deliveryDetails.house,
          landmark: newOrder.deliveryDetails.landmark,
          city: newOrder.deliveryDetails.city,
          zip: newOrder.deliveryDetails.zip,
          number: newOrder.deliveryDetails.number,
          email: newOrder.deliveryDetails.email,
          type: newOrder.deliveryDetails.type
        },
        userId: newOrder.userId,
        paymentMethod: newOrder.paymentMethod,
        products: orderProducts,
        totalAmount: newOrder.totalAmount,
        paymentstatus: newOrder.paymentstatus,
        deliverystatus: newOrder.deliverystatus,
        deliverySubtracted: newOrder.deliverySubtracted,
        discount: newOrder.discount,
        deliveryDate: newOrder.deliveryDate,
        returnDate: newOrder.returnDate,
        reason: newOrder.reason,
        discount: newOrder.discount,
        createdAt: newOrder.createdAt
      });
      console.log(newoder, "😉😉😉😉😉😉😉😉😉😉😉");
      let details = req.body;
      console.log(details, "detail");
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "jcjoEs8uH8MNudasaIC3fq1D");
      hmac.update(
        details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']
      );
      hmac = hmac.digest("hex");
      console.log(hmac, "hmac value");
      let orderResponse = details['order[receipt]']
      console.log(orderResponse, "order-response 2");
      let orderObjId = new ObjectId(orderResponse);
      console.log(orderObjId, "1");
      let price = req.body.price * 100
      console.log(price);
      console.log(details['order[amount]']);
      if (hmac === details['payment[razorpay_signature]'] && details['order[amount]'] == price) {
        const cart = await Cart.findOne({ userId: loggedInUserId });
        
        if (cart.discountCode !== null) {
          let usedCoupon = await Usedcoupons.findOne({ userId: loggedInUserId });
          if (!usedCoupon) {
            usedCoupon = new Usedcoupons({
              userId: loggedInUserId,
              usedCoupon: [{
                couponCodes: cart.discountCode
              }]
            });
          } else {
            usedCoupon.usedCoupon.push({
              couponCodes: cart.discountCode
            });
          }
          console.log(usedCoupon, "🤣🤣🤣🤣🤣🤣🤣");
          await usedCoupon.save();
        }
        
  
  
        const productsData = [].concat(...cart.products.map(product => ({ prodId: product.prodId, count: product.count })));
        console.log(productsData, "array of productIds and counts");
        
        const productIds = productsData.map(item => item.prodId);
        console.log(productIds, "array of productIds");
        
        const products = await Product.find({ _id: { $in: productIds } });
        
        for (const product of products) {
          const { prodId, count } = productsData.find(item => item.prodId.toString() === product._id.toString());
          product.stock -= count;
          console.log("Product stock updated:", product.stock, "Count:", count);
          await product.save();
        }
        
        console.log('---------------ORDER MANAGEMENT SUCCESS😘---------------------');
        await newoder.save();
        cart.products = [];
        cart.totalprice = 0
        cart.manageTotal =0
        cart.walletAmount = false
        await cart.save();
        await Order.updateOne(
          { _id: orderObjId },
          {
            $set: {
              paymentstatus: "placed",
            },
          }
        );
  
        console.log("payment is successful");
  
        res.json({ status: true });
      } else {
        await Order.updateOne(
          { _id: orderObjId },
          {
            $set: {
              paymentstatus: "failed",
            },
          }
        );
        console.log("payment is failed");
        res.json({ status: false, errMsg: "" });
      }
    } catch (error) {
      console.log(error, "error");
    }
  },
  

  deleteOrder: async (req, res) => {
    try {
      let orderId = req.query.orderId;
      console.log(orderId);
      let result = await Order.deleteOne({ _id: orderId });

      if (result.deletedCount > 0) {
        res.redirect("account");
      } else {
        res.status(400).json({
          success: false,
          message: "Order not found or could not be deleted",
        });
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ success: false, message: "Error deleting order" });
    }
  },
};
