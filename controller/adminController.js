const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const express = require("express");
const router = express.Router();
const isLoggedInAdmin = require("../middlewares/sessionHandling");
const Product = require("../models/productModels");
const Category = require("../models/categoryModels");
const Admin = require("../models/adminSchema")
const User = require("../models/userModel");
const multer = require("multer");
const sharp = require("sharp");
const { error } = require("toastr");
const bcrypt = require("bcrypt")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

module.exports = {

  adminSignupGet: async (req, res) => {
    try {
      res.render("admin/adminsignup");
    } catch (error) {
      console.log(error);
    }
  },

  adminSignupPost: async (req, res) => {
    try {
      const {admin, email,password} = req.body;
      const existingAdmin = await Admin.findOne({email});
      if(existingAdmin){
      res.redirect("login")
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      req.session.adminData = {
        admin,
        email,
        password: hashedPassword,
      };
      
      const newAdmin = new Admin({
        admin,
        email,
        password
      })

      await newAdmin.save();
      res.redirect('/admin')
    } catch (error) {
      console.log(error);
    }
  },

  AdminloginPage: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin");
    } else {
      res.render("admin/adminLogin");
    }
  },

  AdminLoginPost: async(req, res) => {
    const {email, password} = req.body 
    try {
    const validAdmin = await Admin.findOne({email: req.body.email});
    console.log(validAdmin);
    if(!validAdmin){
      console.log("hello");
        return res.render("admin/adminlogin", {error: "invalid email or password"});
    }

    if (validAdmin.password === req.body.password) {
      req.session.admin = validAdmin;
      res.redirect("/admin");
      return { admin: validAdmin };
    } else {
      return res.render("admin/adminlogin");
    }
   } catch (error) {
    console.log(error);
   }
  },

  AdminlogoutGet: (req, res) => {
    req.session.admin = false;
    res.redirect("/admin/login");
  },

  // ________category______________

  Category: async (req, res) => {
    let categoryData = await Category.find();
    res.render("admin/category", { categoryData,adminLayout: true});
  },

  AddCategoryGet: async (req, res) => {
    let categoryData = await Category.find();
    if (req.session.admin) {
      res.render("admin/addCategories", { categoryData, adminLayout: true});
    }
  },

  AddCategoryPost: async (req, res) => {
    try {
      const category = req.body;
      const CategoryName = category.CategoryName;
      const CategoryDescription = category.CategoryDescription;
      const existingCategory = await Category.findOne({
        CategoryName: { $regex: `^${CategoryName}$`, $options: "i" },
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ success: false, message: "The category already exists." });
      }
      const newCategory = new Category({
        CategoryName: CategoryName,
        CategoryDescription: CategoryDescription,
      });
      await newCategory.save();
      return res.status(200).redirect("addcategories");
    } catch (error) {
      console.error("Error adding category:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to add category." });
    }
  },

  getBlockCategories: async (req, res, next) => {
    try {
      const categoryId = req.query.categoryId;
      if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Invalid categoryId");
      }
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
      category.isBlocked = true;
      await category.save();
      res.redirect("categories");
    } catch (error) {
      next(error);
    }
  },

  getUnblockCategories: async (req, res, next) => {
    try {
      const categoryId = req.query.categoryId;
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error("Category not find");
      }
      category.isBlocked = false;
      await category.save();
      res.redirect("categories");
    } catch (error) {
      next(error);
    }
  },

  getEditCategories: async (req, res, next) => {
    try {
      const categoryId = req.query.categoryId;
      const categoryData = await Category.findById(categoryId);
      if (!categoryData) {
        throw new Error("category not found");
      }
      res.render("admin/editCategories", { categoryData });
    } catch (error) {
      throw new Error(error);
    }
  },

  postEditCategories: async (req, res, next) => {
    try {
      const categoryId = req.params.categoryId;
      const updatedCategoryData = {
        CategoryName: req.body.CategoryName,
        CategoryDescription: req.body.CategoryDescription,
        isListed: req.body.isListed === "on",
      };
      const category = await Category.findById(categoryId);
      if (!category) {
        res.status(404).send("Category not found");
        return;
      }
      category.CategoryName = updatedCategoryData.CategoryName;
      category.CategoryDescription = updatedCategoryData.CategoryDescription;
      category.isListed = updatedCategoryData.isListed;
      category.offerApplied = updatedCategoryData.offerApplied;
      await category.save();
      res.redirect("/admin/categories");
    } catch (error) {
      next(error);
    }
  },

  // ______products____________

  Products: async (req, res) => {
    if (req.session.admin) {
      let productData = await Product.find().populate("category");
      res.render("admin/products", { productData, adminLayout: true });
    }
  },

  AddProductsGet: async (req, res) => {
    try {
      const categories = await Category.find();
      const categoryData = {
        categories,
      };
      res.render("admin/addProducts", { categoryData, adminLayout: true });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).send("Error fetching categories");
    }
  },

  getEditProducts: async (req, res, next) => {
    try {
      const productId = req.query.productId;
      const productData = await Product.findById(productId).populate(
        "category"
      );
      const categoryData = await Category.find();
      if (!productData) {
        throw new Error("Product not found");
      }
      console.log(productData);
      res.render("admin/editProducts", { productData, categoryData , adminLayout: true});
    } catch (error) {
      throw new Error(error);
    }
  },

  getBlockProduct: async (req, res, next) => {
    try {
      const productId = req.query.productId;
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not find");
      }
      product.isBlocked = true;
      await product.save();
      res.redirect("products");
    } catch (error) {
      next(error);
    }
  },

  getUnblockProduct: async (req, res, next) => {
    try {
      const productId = req.query.productId;
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("product not found");
      }
      product.isBlocked = false;
      await product.save();
      res.redirect("products");
    } catch (error) {
      next(error);
    }
  },

  deleteProducts: async(req, res) => {
    try {
    const productId = req.query.productId;
    console.log(productId,'🫂🫂');
    const product = await Product.deleteOne({_id:productId});
    if(!product) {
      throw new Error("product not found");
    }  
    res.redirect("/admin/products")
    } catch (error) {
      console.log(error);
    }
  },

  // _________users_______

  getAllUsers: async (req, res) => {
    try {
      let userData = await User.find();
      res.render("admin/users", { userData, adminLayout: true });
    } catch (error) {
      throw new Error(error);
    }
  },

  getBlockUsers: async (req, res) => {
    try {
      const userId = req.query.userId;
      const user = await User.findById(userId);
      // console.log(userId);
      if (!user) {
        throw new Error("User not Found!");
      }
      user.isActive = false;
      await user.save();
      res.redirect("users");
    } catch (error) {
      throw new Error(error);
    }
  },

  getUnblockUsers: async (req, res) => {
    try {
      const userId = req.query.userId;
      const user = await User.findById(userId);
      console.log(userId);
      if (!user) {
        throw new Error("User not Found!");
      }
      user.isActive = true;
      await user.save();
      res.redirect("users");
    } catch (error) {
      throw new Error(error);
    }
  },
};
