const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModels");
const Product = require("../models/productModels");
const Wallet = require("../models/walletSchema");
const UsedCoupons = require("../models/usedCouponModel");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const { log } = require("util");
const fs = require("fs");
const puppeteer = require("puppeteer");
var easyinvoice = require("easyinvoice");
const PDFservice = require("../services/pdfservice");
const ObjectId = mongoose.Types.ObjectId;
const path = require("path");
let Usedcoupons = require("../models/usedCouponModel");
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

module.exports = {
  getTotalPrice: async (req, res) => {
    const loggedInUserId = req.session.user;
    const totalAmount = req.query.totalPrice;
    try {
      let cart = await Cart.findOne({ user: loggedInUserId });
      if (cart) {
        cart.totalAmount = totalPrice;
        await cart.save();
      }
    } catch (error) {
      console.log(error);
    }
    res.json({ success: true });
  },

  useWallet: async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      let cartItem = await Cart.findOne({ userId: loggedInUserId });
      const wallet = await Wallet.findOne({ userId: loggedInUserId });

      cartItem.totalAmount -= wallet.wallet;
      cartItem.walletAmount = true;
      await cartItem.save();
      res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      res.render("error");
    }
  },

  placeOrder: async (req, res) => {
    const loggedInUserId = req.session.user;
    const cart = await Cart.find({ user: loggedInUserId });
  },

  order: async (req, res) => {
    let { addressId, paymentMethod } = req.body;
    let userId = req.session.user._id;
    let loggedInUserId = req.session.user;
    let wallet = await Wallet.findOne({ user: loggedInUserId });
    try {
      let cart = await Cart.findOne({ user: userId }).populate({
        path: "products.productId",
        model: "Product",
      });

      const orderProducts = cart.products.map((product) => ({
        name: product.productId.productName,
        productId: product.productId._id,
        quantity: product.quantity,
      }));
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
          orderstatus: "placed",
          deliverystatus: "pending",
        });

        if (paymentMethod === "cod") {
          const cart = await Cart.findOne({ user: loggedInUserId });
          if (cart.discountCode !== null) {
            let usedCoupon = await UsedCoupons.findOne({ userId: userId });
            if (!usedCoupon) {
              usedCoupon = new UsedCoupons({
                userId: userId,
                usedCoupon: [
                  {
                    couponCodes: cart.discountCode,
                  },
                ],
              });
            } else {
              usedCoupon.usedCoupon.push({
                couponCodes: cart.discountCode,
              });
            }
            await usedCoupon.save();
          }
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
          await Cart.deleteOne({ user: userId });
          res.json({ codSuccess: true });
        } else if (paymentMethod === "wallet") {
          const cart = await Cart.findOne({ user: loggedInUserId });
          // wallet.wallet = wallet.wallet-newOrder.totalAmount;

          // Check if the wallet balance is sufficient for the purchase
          const purchaseAmount = newOrder.totalAmount;
          if (wallet.wallet >= purchaseAmount) {
            const newBalance = wallet.wallet - purchaseAmount;
            // Subtract the purchase amount from the wallet balance

            // Create a transaction entry for the purchase
            const transactionData = {
              amount: -purchaseAmount, // Use a negative value to represent a deduction
              description: "Purchase",
            };

            // Push the transaction into the wallet's transactions array
            await Wallet.updateOne(
              { _id: wallet._id },
              {
                $set: { wallet: newBalance },
                $push: { transactions: transactionData },
              }
            );
          }

          try {
            await wallet.save();
          } catch (error) {
            console.log(error);
          }

          if (cart.discountCode !== null) {
            let usedCoupon = await UsedCoupons.findOne({
              userId: loggedInUserId,
            });
            if (cart.discountCode !== null) {
              let usedCoupon = await UsedCoupons.findOne({ userId: userId });
              if (!usedCoupon) {
                usedCoupon = new UsedCoupons({
                  userId: userId,
                  usedCoupon: [
                    {
                      couponCodes: cart.discountCode,
                    },
                  ],
                });
              } else {
                usedCoupon.usedCoupon.push({
                  couponCodes: cart.discountCode,
                });
              }
              await usedCoupon.save();
            }
            for (const cartProduct of cart.products) {
              const product = await Product.findById(cartProduct.productId);
              console.log(product,'products');
              if (!product) {
                return res.status(404).json({ error: "Product not found" });
              }

              const newQuantity =
                product.productQuantity - cartProduct.quantity;

              if (newQuantity < 0) {
                return res
                  .status(400)
                  .json({ error: "Insufficient product quantity" });
              }

              product.productQuantity = newQuantity;

              await product.save();
            }
          }
          await newOrder.save();
          await Cart.deleteOne({ user: userId });
          res.json({ codSuccess: true });
        } else if (paymentMethod === "razorpay") {
          var options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: newOrder._id.toString(),
          };

          instance.orders.create(options, function (err, newOrder) {
            let order = new Order({
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
              orderstatus: "placed",
              deliverystatus: "pending",
            });
            if (err) {
              console.error(err);
              res.status(500).json({ error: "Error creating Razorpay order" });
            } else {
              res.json({
                newOrder,
                order,
                totalAmount,
              });
            }
          });
          // await newOrder.save();
          // await Cart.deleteOne({ user: loggedInUserId });
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
    const order = {};

    for (const key in req.body) {
      if (key.startsWith("order[") && key.endsWith("]")) {
        const nestedKeys = key.slice("order[".length, -1).split("][");
        let currentObject = order;
        for (let i = 0; i < nestedKeys.length - 1; i++) {
          const nestedKey = nestedKeys[i];
          if (!currentObject[nestedKey]) {
            currentObject[nestedKey] = {};
          }
          currentObject = currentObject[nestedKey];
        }
        currentObject[nestedKeys[nestedKeys.length - 1]] = req.body[key];
      }
    }
    try {
      const cart = await Cart.findOne({ user: loggedInUserId }).populate({
        path: "products.productId",
        model: "Product",
      });
      const orderProducts = cart.products.map((product) => {
        return {
          name: product.productId.productName,

          productId: product.productId._id,
          quantity: product.quantity,
        };
      });
      const newoder = new Order({
        deliveryDetails: {
          Fullname: order.deliveryDetails.Fullname,
          state: order.deliveryDetails.state,
          house: order.deliveryDetails.house,
          landmark: order.deliveryDetails.landmark,
          city: order.deliveryDetails.city,
          zip: order.deliveryDetails.zip,
          number: order.deliveryDetails.number,
          email: order.deliveryDetails.email,
          type: order.deliveryDetails.type,
        },
        userId: order.userId,
        paymentMethod: order.paymentMethod,
        products: orderProducts,
        totalAmount: order.totalAmount,
        paymentstatus: order.paymentstatus,
        deliverystatus: order.deliverystatus,
        orderstatus: "placed",
        createdAt: order.createdAt,
      });
      let details = req.body;
      const crypto = require("crypto");
      const {
        "response[razorpay_order_id]": orderId,
        "response[razorpay_payment_id]": paymentId,
      } = details;
      let hmac = crypto.createHmac("sha256", "Sw112zqS51KJ3j0MlfSIL4q8");
      hmac.update(orderId + "|" + paymentId);

      hmac = hmac.digest("hex");
      let orderResponse = details["newOrder[receipt]"];
      let orderObjId = new ObjectId(orderResponse);
      let price = req.body.price * 100;
      if (
        hmac === details["response[razorpay_signature]"] &&
        details["newOrder[amount]"] == price
      ) {
        const cart = await Cart.findOne({ user: loggedInUserId });

        if (cart.discountCode !== null) {
          let usedCoupon = await Usedcoupons.findOne({
            userId: loggedInUserId,
          });
          if (!usedCoupon) {
            usedCoupon = new Usedcoupons({
              userId: loggedInUserId,
              usedCoupon: [
                {
                  couponCodes: cart.discountCode,
                },
              ],
            });
          } else {
            usedCoupon.usedCoupon.push({
              couponCodes: cart.discountCode,
            });
          }
          await usedCoupon.save();
        }

        const productsData = [].concat(
          ...cart.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
          }))
        );

        const productIds = productsData.map((item) => item.productId);

        const products = await Product.find({ _id: { $in: productIds } });
        for (const product of products) {
          const { productId, quantity } = productsData.find(
            (item) => item.productId.toString() === product._id.toString()
          );
          product.productQuantity -= quantity;
          await product.save();
        }

        await newoder.save();
        await Cart.deleteOne({ user: loggedInUserId });
        res.json({ status: true, success: true });
        await Order.updateOne(
          { _id: orderObjId },
          {
            $set: {
              paymentstatus: "paid",
            },
          }
        );
      } else {
        await Order.updateOne(
          { _id: orderObjId },
          {
            $set: {
              paymentstatus: "failed",
            },
          }
        );
        res.json({ status: false, errMsg: "" });
      }
    } catch (error) {
      console.log(error, "error");
    }
  },

  deleteOrder: async (req, res) => {
    try {
      let orderId = req.query.orderId;
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

  OrderDetails: async (req, res) => {
    try {
      let loggedInUserId = req.session.user;

      const user = await User.findById(loggedInUserId);
      const categoryData = await Category.find();
      const addressData = await Address.findOne({ userId: loggedInUserId });
      const userOrders = await Order.find({ userId: loggedInUserId }).sort(
        "-createdAt"
      );
      if (user) {
        res.render("shop/orders", {
          user,
          categoryData,
          addressData,
          userOrders,
          userLayout: true,
        });
      } else {
        res.redirect("/");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      let orderId = req.query.orderId;
      let user = req.session.user;
      let orderData = await Order.findById(orderId)
        .populate("products.productId")
        .exec();
      const categoryData = await Category.find();

      if (!user) {
        res.redirect("/login");
      } else {
        res.render("shop/orderdetails", {
          orderData,
          user,
          categoryData,
          userLayout: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  cancelOrReturn: async (req, res) => {
    // try {
    const orderId = req.body.orderId;
    // const order = await Order.findById(orderId).populate('products.productId');
    const status = req.body.status;
    let returnReason = req.body.returnReason;
    try {
      const loggedInUserId = req.session.user;

      // Check if a wallet already exists for the user
      const userWallet = await Wallet.findOne({ user: loggedInUserId });

      if (!userWallet) {
        // Create a new wallet if it doesn't exist
        const newWallet = new Wallet({
          user: loggedInUserId,
          wallet: 0,
        });

        // Save the new wallet to the database
        await newWallet.save();
      }

      // Redirect to the 'account' page
    } catch (error) {
      console.log(error);
    }

    if (status === "cancellationrequest") {
      try {
        Order.updateOne(
          { _id: orderId },
          {
            $set: {
              cancellationrequest: true,
              deliverystatus: "cancellation requested",
              orderstatus: "cancellation requested",
            },
          }
        ).then(() => {
          return res.status(200).json({ success: true });
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json(error);
      }
    } else if (status === "returnrequest") {
      try {
        Order.updateOne(
          { _id: orderId },
          {
            $set: {
              returnrequest: true,
              returnreason: returnReason,
              deliverystatus: "return requested",
              orderstatus: "return requested",
            },
          }
        ).then(() => {
          return res.status(200).json({ success: true });
        });
      } catch (error) {
        console.log(error);
      }
    }
  },

  cancelOrReturnApproval: async (req, res) => {
    try {
      let status = req.body.status;
      console.log(status,'status');
      let orderId = req.body.orderId;
      const orderToUpdate = await Order.findOne({ _id: orderId });
      let userId = orderToUpdate.userId;
      let walletToUpdate;
      let cancellationStatus = orderToUpdate.cancellationrequest;
      if (status === "approved" && cancellationStatus === true) {
        Order.updateOne(
          { _id: orderId },
          {
            $set: {
              cancellationapproval: true,
              orderstatus: "cancelled",
              deliverystatus: "cancelled",
              cancellationrequest: false,
            },
          }
        ).then(async () => {
          if (
            orderToUpdate.paymentMethod === "razorpay" ||
            orderToUpdate.paymentMethod === "wallet"
          ) {
            const walletToUpdate = await Wallet.findOne({ user: userId });
            if (walletToUpdate) {
              const transactionData = {
                amount: orderToUpdate.totalAmount, // The transaction amount
                description: "Refund", // Description of the transaction (optional)
              };
              walletToUpdate.wallet += orderToUpdate.totalAmount;
              walletToUpdate.transactions.push(transactionData);
              await walletToUpdate.save();
            }
          }
          for (const productOrder of orderToUpdate.products) {
            const productId = productOrder.productId._id;
            const quantityToAdd = productOrder.quantity;

            const productToUpdate = await Product.findById(productId);

            if (productToUpdate) {
              // Update the productQuantity field by adding the quantity from the order
              productToUpdate.productQuantity += quantityToAdd;

              // Save the updated product
              await productToUpdate.save();
              console.log(
                `Product quantity updated for ${productToUpdate.productName}`
              );
            }
          }
          return res.status(200).json({ success: true });
        });
      } else if (
        status === "approved" &&
        orderToUpdate.returnrequest === true
      ) {
        Order.updateOne(
          { _id: orderId },
          {
            $set: {
              returnapproval: true,
              orderstatus: "returned",
              deliverystatus: "returned",
              returnrequest: false,
            },
          }
        ).then(async () => {
          if (
            orderToUpdate.paymentMethod === "razorpay" ||
            orderToUpdate.paymentMethod === "wallet"
          ) {
            const walletToUpdate = await Wallet.findOne({ user: userId });
            if (walletToUpdate) {
              walletToUpdate.wallet += orderToUpdate.totalAmount;
              await walletToUpdate.save();
            }
          }
          for (const productOrder of orderToUpdate.products) {
            const productId = productOrder.productId._id;
            const quantityToAdd = productOrder.quantity;

            const productToUpdate = await Product.findById(productId);

            if (productToUpdate) {
              // Update the productQuantity field by adding the quantity from the order
              productToUpdate.productQuantity += quantityToAdd;

              // Save the updated product
              await productToUpdate.save();
              console.log(
                `Product quantity updated for ${productToUpdate.productName}`
              );
            }
          }
          return res.status(200).json({ success: true });
        });
      // }else if( status === "rejectedr" &&
      // orderToUpdate.returnrequest === true){
      //   console.log('rejectedr');
      //   Order.updateOne(
      //     { _id: orderId },
      //     {
      //       $set: {
      //         returnapproval: false,
      //         orderstatus: "return rejected",
      //         deliverystatus: "NA",
      //         returnrequest: false,
      //       },
      //     }
      //   ).then(()=>{
      //     console.log('rejected return request');
      //   })
      }
    } catch (error) {
      console.log(error);
    }
  },

  orderSuccess: async (req, res) => {
    try {
      res.render("shop/ordersuccess");
    } catch (error) {
      console.log(error);
    }
  },

  generateInvoice: async (req, res) => {
    try {
      let orderId = req.query.orderId;
      const order = await Order.findById(orderId).populate({
        path: "products.productId",
        model: "Product",
      });

      if (!order) {
        throw new Error("Order not found");
      }
      const productDetails = [];

      for (const product of order.products) {
        const productId = product.productId;
        const productName = productId.productName;
        const productQuantity = product.quantity;
        const productPrice = productId.productPrice;

        productDetails.push({
          productId: productId,
          quantity: productQuantity,
          description: productName,
          price: productPrice,
        });
      }
      res.render("shop/invoice", { productDetails, order });

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(
        `${req.protocol}://${req.get(
          "host"
        )}/generateInvoice?orderId=65116dfd3e88f1880b996c83`,
        {
          waitUntil: "networkidle2",
        }
      );

      page.setViewport({ width: 1680, height: 1050 });

      const pdfn = await page.pdf({
        path: `${path.join(__dirname, "../public", "invoice" + " .pdf")}`,
        format: "A4",
      });

      await browser.close();

      const pdfURL = path.join(__dirname, "../public", "invoice" + " .pdf");

      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdfn.length,
      });
      res.sendFile(pdfURL);
    } catch (error) {
      console.log(error);
    }
  },
  InvoiceDownload: async (req, res) => {
    try {
      const orderId = req.body.orderId;
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(
        `${req.protocol}://${req.get(
          "host"
        )}/generateInvoice?orderId=65116dfd3e88f1880b996c83`,
        {
          waitUntil: "networkidle2",
        }
      );

      page.setViewport({ width: 1680, height: 1050 });

      const pdfn = await page.pdf({
        path: `${path.join(__dirname, "../public", "invoice" + " .pdf")}`,
        format: "A4",
      });

      await browser.close();

      const pdfURL = path.join(__dirname, "../public", "invoice" + " .pdf");

      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdfn.length,
      });
      res.sendFile(pdfURL);
    } catch (error) {
      console.log(error);
    }
  },
};
