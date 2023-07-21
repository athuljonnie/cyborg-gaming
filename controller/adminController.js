const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const express = require("express");
const router = express.Router();
const isLoggedInAdmin = require("../middlewares/sessionHandling");
const product = require("../models/productModels");
const Category = require("../models/categoryModels");
const User = require("../models/userModel");
module.exports = {
  AdminHomePage: async (req, res, next) => {
    res.render("admin/adminHome");
  },

  AdminloginPage: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin");
    } else {
      res.render("admin/adminLogin");
      console.log("hellofromadminLoginPage");
    }
  },

  AdminLoginPost: (req, res) => {
    if (
      req.body.email === process.env.ADMIN_EMAIL &&
      req.body.password === process.env.ADMIN_PASSWORD
    ) {
      req.session.admin = true;
      res.redirect("/admin");
    } else {
      // req.session.admin = false;
      res.redirect("/admin/login");
    }
  },

  AdminlogoutGet: (req, res) => {
    req.session.admin = false;
    res.redirect("/admin/login");
  },

  Category: (req, res) => {
    res.render('admin/category')
  },

  AddCategoryGet: (req, res) => {
    if (req.session.admin) {
      res.render("admin/addCategories");
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

      return res
        .status(200)
        .json({ success: true, message: "Category added successfully." });
    } catch (error) {
      console.error("Error adding category:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to add category." });
    }
  },

  Products: (req, res) => {
    if (req.session.admin) {
      res.render("admin/products");
    }
  },
  AddProducts: (req, res) => {
    if (req.session.admin) {
      res.render("admin/addProducts");
    }
  },
};
