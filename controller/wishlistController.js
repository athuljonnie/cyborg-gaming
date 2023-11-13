const Product = require("../models/productModels");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModels");
const Wishlist = require("../models/wishlistModel");

module.exports = {
  getWishList: async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      const categoryData = await Category.find();
      const wishlistItems = await Wishlist.find({
        user: loggedInUserId,
      }).populate({
        path: "products.productId",
        model: "Product",
      });
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
    const productId = req.query.productId;
    const loggedInUserId = req.session.user;

    try {
      let wishlistItem = await Wishlist.findOne({
        user: loggedInUserId,
      });

      if (!wishlistItem) {
        const newWishlist = new Wishlist({
          user: loggedInUserId,
          products: [
            {
              productId: productId,
              quantity: 1,
            },
          ],
        });
        const doc = await newWishlist.save();
        return res.status(200).json({ success: true, doc });
      }

      const exist = wishlistItem.products.filter(
        (doc) => doc.productId.toString() === productId
      );

      if (exist.length > 0) {
        return res
          .status(200)
          .json({ success: false, message: "already exists in wishlist" });
      }

      const newItem = await Wishlist.updateOne(
        { _id: wishlistItem._id },
        {
          $push: {
            products: {
              productId: productId,
              quantity: 1,
            },
          },
        }
      )
      if (newItem.acknowledged) {
        return res.status(200).json({ success: true })
      }


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
      if (wishlist.products.length === 0) {
        await wishlist.deleteOne();
      } else {
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
