const Product = require("../models/productModels");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModels");
const Wishlist = require("../models/wishlistModel");

module.exports = {
  getWishList: async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      console.log("One moree");
      const categoryData = await Category.find();
      const wishlistItems = await Wishlist.find({
        user: loggedInUserId,
      }).populate({
        path: "products.productId",
        model: "Product",
      });
      console.log(wishlistItems.length, "Wishlist Items");
      if (!loggedInUserId) {
        res.redirect("/login");
      } else {
        res.render("shop/wishlist", {
          wishlistItems,
          user: loggedInUserId,
          userLayout: true,
          categoryData,
        });
      }
    } catch (err) {
      console.log(err);
      res.render("error");
    }
  },

  wishlistLoad: async (req, res) => {
    try {
      const productId = req.query.productId;
      const product = await Product.findById(productId);
      console.log(product, "❤️");
      const loggedInUserId = req.session.user;
      console.log(loggedInUserId, "------------------loggrdinid");
      let wishlistItem = await Wishlist.findOne({
        user: loggedInUserId,
      }).populate({
        path: "products.productId",
        model: "Product",
      });
      console.log(wishlistItem);

      if (wishlistItem) {
        wishlistItem.products.push({
          productId: productId,
          quantity: 1,
        });
      } else {
        const newWishlist = new Wishlist({
          user: loggedInUserId,
          products: [
            {
              productId: productId,
              quantity: 1,
            },
          ],
          // totalAmount: totalAmount,
        });
        wishlistItem = await newWishlist.save();
      }

      // cartItem.totalAmount = updatedTotalAmount;
      await wishlistItem.save();
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ success: false, error: "Error adding product to Wishlist" });
    }
  },

  removeFromWishlist: async (req, res) => {
    try {
      const productId = req.query.productId;
      const loggedInUserId = req.session.user;

      const wishlist = await Wishlist.findOne({ user: loggedInUserId });
      console.log(wishlist);
      if (!wishlist) {
        return res.json({ success: false, error: "Wishlist not found" });
      }

      const productIndex = wishlist.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (productIndex === 1) {
        return res.json({
          success: false,
          error: "Product not found in the wishlist",
        });
      }

      wishlist.products.splice(productIndex, 1);
      if(wishlist.products.length === 0){
        await wishlist.deleteOne();
      }else{
      await wishlist.save();
    }
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
        error: "Error removing product from the wishlist",
      });
    }
  },
};
