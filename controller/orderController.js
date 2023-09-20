const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const User = require('../models/userModel');
const Category = require('../models/categoryModels')
const Product = require("../models/productModels");
const Razorpay = require("razorpay");
const { log } = require("util");
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

module.exports = {


  getTotalPrice: async (req, res) => {
    const loggedInUserId = req.session.user;
    const totalAmount = req.query.totalPrice;
    console.log(totalPrice);
    try {
      let cart = await Cart.findOne({ user: loggedInUserId });
      if (cart) {
        cart.totalAmount = totalPrice;
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

    try {
      let cart = await Cart.findOne({ user: userId }).populate({
        path: "products.productId",
        model: "Product",
      });

      const orderProducts = cart.products.map((product) => ({
        name: product.productId.productName,
        productId: product._id,
        quantity: product.quantity,
      }));
      console.log(orderProducts, "products 🫂💕😑💕🫂😊");
      let totalAmount = cart.totalAmount;

      const deliveryAddress = await Address.findOne({
        "addresses._id": addressId,
      });

      if (deliveryAddress && deliveryAddress.addresses.length > 0) {
        const selectedAddress = deliveryAddress.addresses.find(
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
          paymentMethod: paymentMethod,
          products: orderProducts,
          totalAmount: totalAmount,
          paymentstatus: paymentMethod === "cod" ? "cod" : "pending",
          deliverystatus: "pending",
        });

        if (paymentMethod === "cod") {
          for (const cartProduct of cart.products) {
            const product = await Product.findById(cartProduct.productId);

            if (!product) {
              return res.status(404).json({ error: "Product not found" });
            }

            const newQuantity = product.productQuantity - cartProduct.quantity;

            if (newQuantity < 0) {
              return res
                .status(400)
                .json({ error: "Insufficient product quantity" });
            }

            product.productQuantity = newQuantity;

            await product.save();
          }

          await newOrder.save();
          console.log(newOrder,"💕💕💕💕");
          await Cart.deleteOne({ user: userId });
          res.json({ codSuccess: true });



        } else if (paymentMethod === "razorpay") {
          console.log(newOrder._id, "🐲55");
          var options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: newOrder._id.toString(),
          };

          instance.orders.create(options, function (err, order) {
            if (err) {
              console.error(err);
              res.status(500).json({ error: "Error creating Razorpay order" });
            } else {
              res.json({
                order: order,
                newOrder: newOrder,
                price: totalAmount,
              });
            }
          });
        } else {
          console.log("error occured");
        }
      } else {
        res.json({ success: false, error: "Invalid address ID" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error processing order" });
    }
  },


  verifyPayment: async (req, res) => {
    const loggedInUserId = req.session.user;
    const newOrder = {};
    for (const key in req.body) {
      if (key.startsWith("newOrder[")) {
        const nestedKeys = key.slice("newOrder[".length, -1).split("][");
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
    try {
      const cart = await Cart.findOne({ userId: loggedInUserId });
      const orderProducts = cart.products.map((product) => {
        const price =
          product.cartOffer === true ? product.offerPrice : product.price;
        return {
          name: product.productName,
          image: product.image[0],
          category: product.category,
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
          type: newOrder.deliveryDetails.type,
        },
        userId: newOrder.userId,
        paymentMethod: newOrder.paymentMethod,
        products: orderProducts,
        totalAmount: newOrder.totalAmount,
        paymentstatus: newOrder.paymentstatus,
        deliverystatus: newOrder.deliverystatus,
        createdAt: newOrder.createdAt,
      });
      let details = req.body;
      console.log(details, "detail");
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "jcjoEs8uH8MNudasaIC3fq1D");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      console.log(hmac, "hmac value");
      let orderResponse = details["order[receipt]"];
      console.log(orderResponse, "order-response 2");
      let orderObjId = new ObjectId(orderResponse);
      console.log(orderObjId, "1");
      let price = req.body.price * 100;
      console.log(price, "😁");
      console.log(details["order[amount]"]);
      if (
        hmac === details["payment[razorpay_signature]"] &&
        details["order[amount]"] == price
      ) {
        const cart = await Cart.findOne({ userId: loggedInUserId });

        // if (cart.discountCode !== null) {
        //   let usedCoupon = await Usedcoupons.findOne({
        //     userId: loggedInUserId,
        //   });
        //   if (!usedCoupon) {
        //     usedCoupon = new Usedcoupons({
        //       userId: loggedInUserId,
        //       usedCoupon: [
        //         {
        //           couponCodes: cart.discountCode,
        //         },
        //       ],
        //     });
        //   } else {
        //     usedCoupon.usedCoupon.push({
        //       couponCodes: cart.discountCode,
        //     });
        //   }
        //   console.log(usedCoupon, "🤣🤣🤣🤣🤣🤣🤣");
        //   await usedCoupon.save();
        // }

        const productsData = [].concat(
          ...cart.products.map((product) => ({
            productId: product.productId,
            quantity: product.productQuantity,
          }))
        );
        console.log(productsData, "array of productIds and counts");

        const productIds = productsData.map((item) => item.productId);
        console.log(productIds, "array of productIds");

        const products = await Product.find({ _id: { $in: productId } });
        console.log(products, "ordermanagement");
        for (const product of products) {
          const { prodId, count } = productsData.find(
            (item) => item.prodId.toString() === product._id.toString()
          );
          product.productQuantity -= quantity;
          await product.save();
        }

        console.log(
          "---------------ORDER MANAGEMENT SUCCESS😘---------------------"
        );
        console.log(newoder, "new order");
        await newoder.save();
        await Cart.deleteOne({ user: loggedInUserId });

        // cart.products = [];
        // cart.totalprice = 0;
        // cart.manageTotal = 0;
        // cart.walletAmount = false;
        // await cart.save();
        res.json({ success: true });
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



  OrderDetails : async(req, res) => {
    try{
        let loggedInUserId = req.session.user

        const userData= await User.findById(loggedInUserId);
        const categoryData = await Category.find()
        const addressData = await Address.findOne({userId : loggedInUserId});
        const userOrders = await Order.find({userId : loggedInUserId}).sort("-createdAt");
        if(userData){
            res.render('shop/orders', {userData, categoryData, addressData, userOrders, userLayout: true});
        }else{
            res.redirect("/");
        }
    }catch(error){
        throw new Error(error)
    }



  },

  getOrderDetails: async(req,res) => {
    try{
      let orderId = req.query.orderId
      console.log(orderId);
      let user = req.session.user;
      let orderData = await Order.findOne({_id: orderId});

      if(!user){
        res.redirect('/');
      } else {
        res.render('shop/orderdetails', {orderData, user, userLayout: true})
      }
    }catch(error){
      console.log(error);
    }


  }
}
