const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const Product = require('../models/productModels')
const bcrypt = require('bcrypt');
const twilio = require('twilio');

module.exports = {
  // doSignUp: (body) => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       var oldUser = await User.findOne({ email: body.email });
  //       var oldPhoneNumberUser = await User.findOne({
  //         phonenumber: body.phonenumber,
  //       });

  //       if (oldUser) {
  //         resolve({ emailStatus: true, phoneNumberStatus: false, user: null });
  //       } else if (oldPhoneNumberUser) {
  //         resolve({ emailStatus: false, phoneNumberStatus: true, user: null });
  //       } else {
  //         const saltRounds = 10;
  //         let password = body.password.toString();
  //         let newpassword = await bcrypt.hash(password, saltRounds);
  //         const newUser = new User({
  //           username: body.username,
  //           email: body.email,
  //           password: newpassword,
  //           phonenumber: body.phonenumber,
  //         });
  //         var savedUser = await newUser.save();
  //         resolve({
  //           emailStatus: false,
  //           phoneNumberStatus: false,
  //           user: savedUser,
  //         });
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       reject(err);
  //     }
  //   });
  // },

  // doLogin: async (user) => {
  //   try {
  //     const validUser = await User.findOne({ email: user.email });
  //     if (validUser) {
  //       const isPasswordMatch = await bcrypt.compare(
  //         user.password,
  //         validUser.password
  //       );
  //       if (isPasswordMatch) {
  //         return { status: true, user: validUser };
  //       } else {
  //         console.log("Invalid Password");
  //         return { status: false };
  //       }
  //     } else {
  //       throw new Error("User not found");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // },


  generateOtp: async (body) => {
    console.log(body);
    try {
      const customer = await User.findOne({ phonenumber: body });
      if (customer) {
        twilioFunctions.generateOTP(customer.phonenumber);
        return { status: true, body };
      } else {
        console.log("No User Found!");
        return { status: false };
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

};