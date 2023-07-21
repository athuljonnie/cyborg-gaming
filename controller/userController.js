const mongoose = require('mongoose')
const userHelpers = require("../helpers/userHelpers");
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
module.exports = {
  homePage: async (req, res, next) => {
    let user = req.session.user;
    res.render('shop/home')
//     try {
//       const allproducts = await Products.find();
//       const allcategory = await Category.find();
//       const products = await Products.find();
      
// } catch (error) {
//       console.error(error);
//       res.render("catchError", {
//         message: err.message,
//         user: req.session.user,
//       });
//     }
  },

  loginPage: async (req, res) => {
    res.render("shop/userlogin/userLogin");
  },

  //signup

  signUpPage: (req, res) => {
    const phone = req.query.phonenumber;
    res.render("shop/userlogin/userSignup");
  },

  

  signUpPost: (req, res) => {
    return new Promise(async (resolve, reject) => {
      try {
        var oldUser = await User.findOne({ email: req.body.email });
        var oldPhoneNumberUser = await User.findOne({
          phonenumber: req.body.phonenumber,
        });
  
        if (oldUser) {
          resolve({ emailStatus: true, phoneNumberStatus: false, user: null });
        } else if (oldPhoneNumberUser) {
          resolve({ emailStatus: false, phoneNumberStatus: true, user: null });
        } else {
          const saltRounds = 10;
          let password = req.body.password.toString();
          let newpassword = await bcrypt.hash(password, saltRounds);
          const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: newpassword,
            phonenumber: req.body.phonenumber,
          });
          var savedUser = await newUser.save();
          resolve({
            emailStatus: false,
            phoneNumberStatus: false,
            user: savedUser,
          });
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    })
      .then((userData) => {
        if (userData.emailStatus) {
          const msg = "Email already exists";
          res.render("shop/userlogin/userSignup.ejs", { msg });
        } else if (userData.phoneNumberStatus) {
          const msg2 = "Phone number already exists";
          res.render("shop/userlogin/userSignup.ejs", { msg2 });
        } else if (userData.user) {
          req.session.login = true;
          req.session.User = userData.user;
          res.redirect("/");
        }
      })
      .catch((error) => {
        console.log(error);
        // res.render("error");
      });
  },

  loginPost: async (req, res) => {
    const {email, password} = req.body;
    try {
      const validUser = await User.findOne({ email: req.body.email });
      console.log('hellofromloginPost');
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
          console.log("Invalid Password");
          return { status: false };
        }
      } else {
        // User with the provided email not found
        const blockmsg = "Incorrect Password or Email...!!";
        res.render("shop/userlogin/userLogin.ejs", { blockmsg });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  logOutGet: async (req,res) => {
    req.session.user =false;
    res.redirect('/');
  } 
}

 

 
