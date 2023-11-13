const Product = require("../models/productModels");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModels");
const Wishlist = require("../models/wishlistModel");
const Coupon = require('../models/couponModel');
module.exports = {
  cartLoad: async (req, res) => {
    try {
      const productId = req.query.productId;
      const loggedInUserId = req.session.user;
      if (loggedInUserId) {
        let product = await Product.findOne({ _id: productId })




        let price = 0

        if (product.offer === true || product.catoffer === true) {
          if (product.offerPercentage > product.catofferPercentage) {
            price = product.offerPrice;
            offerEnd = product.offerEnd;
          } else {
            price = product.catofferPrice;
            offerEnd = product.catofferEnd;
          }
          cartOffer = true;
        } else {
          price = product.productPrice;
          offerEnd = null
          cartOffer = false;
        }


        let cartItems = await Cart.find({ user: loggedInUserId }).populate({
          path: "products.productId",
          model: "Product",
        });

        let wishlistItem = await Wishlist.findOne({ user: loggedInUserId });
        let cartItem = cartItems[0];
        if (wishlistItem) {
          const productIndexInWishlist = wishlistItem.products.findIndex(
            (item) => item.productId.toString() === productId
          );
          if (productIndexInWishlist !== -1) {
            wishlistItem.products.splice(productIndexInWishlist, 1);
            await wishlistItem.save();
          }
        }





        if (cartItem) {

          const existingProductIndex = cartItem.products.findIndex(
            (item) => item.productId._id.toString() === productId
          );

          if (existingProductIndex !== -1) {
            cartItem.products[existingProductIndex].quantity += 1;
          } else {
            cartItem.products.push({
              productId: productId,
              offerPrice: price,
              quantity: 1,
            });

          }
        } else {
          const newCartItem = new Cart({
            user: loggedInUserId,
            products: [
              {
                productId: productId,
                quantity: 1,
              },
            ],

          });
          cartItem = await newCartItem.save();
        }

        await cartItem.save();
        res.json({ success: true });
      }
    }
    catch (error) {
      console.log(error);
      if (req.session.user) {
        res.json({ success: false, message: "Error adding product to cart" });
      }
    }
  },

  cart: async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      const cartItems = await Cart.find({ user: loggedInUserId }).populate({
        path: "products.productId",
        model: "Product",
      });
      const coupons = await Coupon.find();
      for (const cartItem of cartItems) {

        cartItem.products = cartItem.products.filter(
          (product) => product.productQuantity !== 0
        );
      }
      const categoryData = await Category.find();

      res.render("shop/cart", {
        cartItems,
        user: loggedInUserId,
        userLayout: true,
        categoryData,
        coupons,

      });

    } catch (error) {
      res.render(error);
    }
  },

  deleteCart: async (req, res) => {
    try {
      const productId = req.query.productId;

      const loggedInUserId = req.session.user;
      const cartItem = await Cart.findOne({ user: loggedInUserId });
      if (cartItem) {
        const productIndex = cartItem.products.findIndex(
          (product) => product._id.toString() === productId
        );
        if (productIndex !== -1) {
          cartItem.products.splice(productIndex, 1);
          await cartItem.save();
        }
        if (!cartItem.products.length) {
          Cart.deleteOne({ user: loggedInUserId }).then(res => {
          })
        }
      }
      res.redirect("/cart");
    } catch (err) {
      console.log(err);
      res.render("error");
    }
  },

  postUpdateQuantity: async (req, res) => {
    try {
      const { productId, quantity, totalPrice } = req.body;
      let loggedInUserId = req.session.user._id
      const updatedProduct = await Cart.findOneAndUpdate(
        { "products._id": productId },
        {
          $set: {
            "products.$.quantity": quantity,

          }
        },
        { new: true }
      );
      const cartToUpdate = await Cart.findOneAndUpdate({ user: loggedInUserId }, { $set: { totalAmount: totalPrice, cartOffer: false } });
      res.json({ success: true, message: "Quantity  updated successfully" });
    } catch (error) {
      console.error("Error updating quantity and price:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to update quantity and price",
        });
    }
  },
};
