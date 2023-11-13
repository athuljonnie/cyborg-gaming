const Cart = require("../models/cartModel");
const Category = require("../models/categoryModels");
const Product = require("../models/productModels");
const User = require("../models/userModel");

Product.schema.index({ productName: "text" });
Category.schema.index({ category: "text" });
module.exports = {
  // --------filterProducts----------

  getAllProducts: async (req, res) => {
    try {
      const categoryData = await Category.find();
      let user = req.session.user;

      if (req.body.sortOption === "price-high-to-low") {
        const products = await Product.find()
          .populate("category")
          .sort("-productPrice");
        res.render("shop/allproducts", { products, user, categoryData });
      } else if (req.body.sortOption === "price-low-to-high") {
        const products = await Product.find()
          .populate("category")
          .sort("productPrice");
        res.render("shop/allproducts", { products, user, categoryData });
      } else if (req.body.sortOption === "a-z") {
        const products = await Product.find()
          .populate("category")
          .sort("productName");
        res.render("shop/allproducts", { products, user, categoryData });
      } else {
        const products = await Product.find().populate("category");
        res.render("shop/allproducts", { products, user, categoryData });
      }
    } catch (error) {
      throw new Error("Cant find Products");
    }
  },


  getSearch: async (req, res) => {
    try {
      const searchTerm = req.query.searchTerm;
      const regexPattern = new RegExp(searchTerm, "i");

      let categoryData = await Category.find({
        $text: { $search: searchTerm },
      });

      let productsByTextSearch = await Product.find({
        $text: { $search: searchTerm },
      }).populate("category");

      let productsByRegexSearch = await Product.find({
        productDescription: { $regex: regexPattern },
      }).populate("category");

      let products = [...productsByTextSearch, ...productsByRegexSearch];

      let user = req.session.user;
      res.render("shop/searchresults", {
        categoryData,
        products,
        searchTerm,
        user,
      });
    } catch (error) {
      console.log(error);
    }

  },
}
