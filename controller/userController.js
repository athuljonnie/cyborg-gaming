const Address = require("../models/addressModel");
const User = require("../models/userModel");
const Product = require("../models/productModels");
const Category = require("../models/categoryModels");
const Order = require("../models/orderModel");
const bcrypt = require("bcrypt");
const isLoggedIn = require("../middlewares/sessionHandling");
const Cart = require("../models/cartModel");
const mongoose = require("mongoose");
const Wallet = require("../models/walletSchema");
const Coupon = require("../models/couponModel");
const { success } = require("toastr");
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
    res.render("shop/home", {
      productData,
      user,
      categoryData,
      userLayout: true,
    });
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
          res.render("shop/userlogin/invalidOTP", {
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

      if (validUser.isActive === false) {
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

  getChangePassword: async (req, res) => {
    try {
      res.render("shop/userlogin/changepassword");
    } catch (error) {
      console.log(error);
    }
  },

  changePassword: async (req, res) => {
    const userId = req.session.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }


      const isPasswordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }


      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New passwords do not match" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);


      user.password = hashedPassword;


      await user.save();

      res.redirect("account");
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getEmail: async (req, res) => {
    try {
      res.render("shop/userlogin/getEmail");
    } catch (error) {
      console.log(error);
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email });
      if (user) {
        if (!user.isBlocked) {
          const number = user.number;
          client.verify.v2
            .services(serviceSid)
            .verifications.create({
              to: "+91" + number,
              channel: "sms",
            })
            .then((verification) => {
              res.render("shop/userlogin/forgotpassword", { number, email });
            });
        } else {
          res.status(403).send("User is blocked");
        }
      }
    } catch (err) {
      console.error("Error generating OTP:", err);
    }
  },

  postNewpassword: async (req, res) => {
    const email = req.query.email;
    const password = req.body.password;
    try {
      const user = await User.findOne({ email });
      if (user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        req.session.user = user;
        res.redirect("/");
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },

  postForgotPasswordVerify: async (req, res) => {
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


          let email = req.query.email;
          res.render("shop/userlogin/newpassword", { email });
        } else {
          res.render("shop/userlogin/invalidOTP", {
            error: "Invalid OTP. Please try again.",
          });
        }
      }).catch((error) => {
        console.log(error);
      });
  },

  newPassword: async (req, res) => {
    try {
      res.render("shop/userlogin/newpassword");
    } catch (error) {
      console.log(error);
    }
  },

  logOutGet: async (req, res) => {
    req.session.user = false;
    res.redirect("/");
  },

  getEditUser: async (req, res) => {
    try {
      loggedInUserId = req.session.user;
      let user = await User.findOne(loggedInUserId);
      if (loggedInUserId) {
        res.render("shop/editUser", { user });
      } else {
        res.redirect("/");
      }
    } catch (error) {
      console.log(error);
    }
  },

  postEditUser: async (req, res) => {
    try {
      const { username, email, number } = req.body;
      loggedInUserId = req.session.user;
      let user = await User.findOne(loggedInUserId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.username = username;
      user.email = email;
      user.number = number;

      await user.save();

      res.redirect("account");
    } catch (error) {
      console.log(error);
    }
  },

  getCategoryDetails: async (req, res) => {
    try {
      const categoryData = await Category.find();
      res.render("shop/category", { categoryData, userLayout: true });
    } catch (error) {
      throw new error(error);
    }
  },

  getProductsByCategory: async (req, res) => {
    let sortOption = req.body// Assuming 'sortOption' is the key you are sending in the POST request



    const categoryData = await Category.find();
    let user = req.session.user;

    let categoryId = req.query.cat;

    try {
      if (req.body.sortOption === "price-high-to-low") {
        const productData = await Product.find({ category: categoryId })
          .populate("category")
          .sort("-productPrice");
        res.render("shop/categorypage", { productData, user, categoryData });
      } else if (req.body.sortOption === "price-low-to-high") {

        const productData = await Product.find({ category: categoryId })
          .populate("category")
          .sort("productPrice");
        res.render("shop/categorypage", { productData, user, categoryData });
      } else if (req.body.sortOption === "a-z") {
        const productData = await Product.find({ category: categoryId })
          .populate("category")
          .sort("productName");
        res.render("shop/categorypage", { productData, user, categoryData });
      } else {
        const productData = await Product.find({ category: categoryId }).populate("category");
        res.render("shop/categorypage", { productData, user, categoryData });
      }
    }
    catch (error) {
      throw new Error(error, "Category Error");
    }
  },

  getProductDetails: async (req, res) => {
    try {
      const productId = req.query.productId;
      const user = req.session.user;
      const productData = await Product.findById(productId).populate(
        "category"
      );
      const categoryData = await Category.find();

      res.render("shop/productpage", {
        productData,
        categoryData,
        userLayout: true,
        user,
      });
    } catch (error) {
      throw new Error(error);
    }
  },

  precheckout: async (req, res) => {
    try {
      const loggedInUserId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: loggedInUserId });

      const cartItems = await Cart.find({ user: loggedInUserId }).populate({
        path: "products.productId",
        model: "Product",
      });


      for (const cartItem of cartItems) {
        console.log(cartItem.totalAmount, "totalAmount beeofre updating");
        if (cartItem.cartOffer === true) {
          let totalPrice = cartItem.offerPrice;
          cartItem.totalAmount = totalPrice;
          await cartItem.save();
        }
      }

      console.log("Total prices updated successfully");
      const coupons = await Coupon.find();

      try {

        const currentDate = new Date();


        const deletedCoupons = await Coupon.deleteMany({
          expirationDate: { $lte: currentDate },
        });

        if (deletedCoupons.deletedCount > 0) {
          console.log(`Deleted ${deletedCoupons.deletedCount} expired coupons.`);
        } else {
          console.log('No expired coupons found.');
        }
      } catch (error) {
        console.error('Error deleting expired coupons:', error);
      }


      const user = await User.findById({ _id: loggedInUserId });
      const categoryData = await Category.find();
      const addressData = await Address.findOne({ userId: loggedInUserId });

      res.render("shop/precheckout", {
        cartItems,
        addressData,
        categoryData,
        user,
        wallet,
        coupons,
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  updateDefaultAddress: async (req, res) => {
    const addressId = req.body.addressId;
    try {
      const deliveryAddress = await Address.findOne({
        "addresses._id": addressId,
      });
      if (deliveryAddress && deliveryAddress.addresses.length > 0) {
        const selectedAddress = deliveryAddress.addresses.find(
          (address) => address._id.toString() === addressId
        );
        if (selectedAddress) {
        }
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  },

  createWallet: async (req, res) => {
    try {
      const loggedInUserId = req.session.user;

      const userWallet = await Wallet.findOne({ user: loggedInUserId });

      if (!userWallet) {
        const newWallet = new Wallet({
          user: loggedInUserId,
          wallet: 0,
        });

        await newWallet.save();
      }

      res.redirect("account");
    } catch (error) {
      console.log(error);
    }
  },
};
