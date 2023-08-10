const Address = require("../models/addressModel");
const User = require("../models/userModel");
const Product = require("../models/productModels");
const Category = require("../models/categoryModels");
const bcrypt = require("bcrypt");
const isLoggedIn = require("../middlewares/sessionHandling");
const Cart = require("../models/cartModel");
const mongoose = require("mongoose");
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = {
  homePage: async (req, res, next) => {
    let productData = await Product.find().populate("category");
    const categoryData = await Category.find();
    let user = req.session.user;
    res.render("shop/home", { productData, user, categoryData });
  },

  loginPage: async (req, res) => {
    error = "";
    res.render("shop/userlogin/userLogin", { error });
  },

  signUpPage: (req, res) => {
    const phone = req.query.phonenumber;
    res.render("shop/userlogin/userSignup");
  },

  signUpPost: async (req, res) => {
    try {
      const { username, email, number, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const error =
          "Email is already in use. Please choose a different email.";
        return res.render("shop/userlogin/userSignup", { error });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      req.session.userData = {
        username,
        email,
        number,
        password: hashedPassword,
      };
      res.redirect("/verify");
    } catch (err) {
      console.error("Error saving user:", err);
      res.render("error", {
        error: "An error occurred while saving the user.",
      });
    }
  },

  getVerify: async (req, res) => {
    try {
      const number = req.session.userData.number;
      if (!number) {
        res.status(400).send("Phone number not found");
        return;
      }
      const verification = await client.verify.v2
        .services(serviceSid)
        .verifications.create({
          to: `+91${number}`,
          channel: "sms",
        });
      res.render("shop/userlogin/otp", { number });
    } catch (err) {
      console.error("Error generating OTP:", err);
    }
  },

  postVerify: async (req, res) => {
    const otp = req.body.otp;
    const number = req.query.number;
    client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: "+91" + number,
        code: otp,
      })
      .then(async (verification) => {
        if (verification.valid === true) {
          const { username, email, number, password } = req.session.userData;
          const newUser = new User({
            username,
            email,
            number,
            password,
          });
          await newUser.save();
          req.session.user = newUser;
          res.redirect("/");
        } else {
          res.render("user/OTP", {
            email: req.session.userData.email,
            error: "Invalid OTP. Please try again.",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },

  loginPost: async (req, res) => {
    const { email, password } = req.body;
    try {
      const validUser = await User.findOne({ email: req.body.email });
      if (!validUser) {
        return res.render("shop/userlogin/userLogin", {
          error: "Invalid email or password",
        });
      }

      if (validUser.isBlocked) {
        return res.render("shop/userlogin/userLogin", {
          error: "Your account has been blocked. Please contact support.",
        });
      }

      if (validUser) {
        const isPasswordMatch = await bcrypt.compare(
          req.body.password,
          validUser.password
        );
        if (isPasswordMatch) {
          req.session.user = validUser;
          res.redirect("/");
          return { status: true, user: validUser };
        } else {
          return res.render("shop/userlogin/userLogin", {
            error: "Invalid email or password",
          });
        }
      } else {
        res.render("shop/userlogin/userLogin.ejs", { error });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  logOutGet: async (req, res) => {
    req.session.user = false;
    res.redirect("/");
  },

  getCategoryDetails: async (req, res) => {
    try {
      const categoryData = await Category.find();
      res.render("shop/category", { categoryData });
    } catch (error) {
      throw new error(error);
    }
  },

  getProductsByCategory: async (req, res) => {
    try {
      let categoryId = req.query.cat;
      const productData = await Product.find({ category: categoryId }).populate(
        "category"
      );
      const categoryData = await Category.find();
      let user = req.session.user;

      res.render("shop/categorypage", { productData, user, categoryData });
    } catch (error) {
      throw new Error("Category Error");
    }
  },

  getProductDetails: async (req, res) => {
    try {
      const productId = req.query.productId;
      const productData = await Product.findById(productId).populate(
        "category"
      );
      const categoryData = await Category.find();

      res.render("shop/productpage", { productData, categoryData });
    } catch (error) {
      throw new Error(error);
    }
  },

  precheckout: async (req, res) => {
    try {
      const loggedInUserId = req.session.user._id;
      cartItems = await Cart.find({ user: loggedInUserId }).populate({
        path: "products.productId",
        model: "Product",
      });;
      const addressData = await Address.findOne({ userId: loggedInUserId });
      res.render("shop/precheckout", { cartItems, addressData });
      console.log(cartItems);
    } catch (error) {
      console.log(error.message);
    }
  },

  updateDefaultAddress: async (req, res) => {
    const addressId = req.body.addressId;
    console.log(addressId, "adress Id");
    try {
      const deliveryAddress = await Address.findOne(
        { 'addresses._id': addressId }
        );
        if (deliveryAddress && deliveryAddress.addresses.length > 0) {
          const selectedAddress = deliveryAddress.addresses.find((address) => address._id.toString() === addressId);
          if (selectedAddress) {
            console.log(selectedAddress);  
             
          }
        }
    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  },
};
