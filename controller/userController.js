const mongoose = require('mongoose')
const userHelpers = require("../helpers/userHelpers");
const User = require('../models/userModel')
const Product = require('../models/productModels')
const Category = require('../models/categoryModels')
const bcrypt = require('bcrypt');
const serviceSid= process.env.TWILIO_SERVICE_SID
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


module.exports = {
  homePage: async (req, res, next) => {
    let productData =await Product.find().populate('category');
    let user = req.session.user;
    res.render('shop/home', {productData, req})
  },

  loginPage: async (req, res) => {
    res.render("shop/userlogin/userLogin");
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
        const error = 'Email is already in use. Please choose a different email.';
        return res.render('shop/userlogin/userSignup', { error });
      }  
      const hashedPassword = await bcrypt.hash(password, 10);
        req.session.userData = {
        username,
        email,
        number,
        password: hashedPassword
      };  
      res.redirect('/verify');  
    } catch (err) {
      console.error('Error saving user:', err);
      res.render('error', { error: 'An error occurred while saving the user.' });
    }
  },


  getVerify: async (req, res) => {
    try {
      const number = req.session.userData.number;  
      if (!number) {
        res.status(400).send('Phone number not found');
        return;
      }  
      const verification = await client.verify.v2.services(serviceSid)
        .verifications
        .create({
          to: `+91${number}`,
          channel: 'sms'
        });  
      console.log(verification.sid, "the otp is generated ");
      res.render('shop/userlogin/otp', { number });  
    } catch (err) {
      console.error('Error generating OTP:', err);
      // Handle the error...
    }
  },


  postVerify: async(req, res) =>{
    const otp= req.body.otp;
    const number = req.query.number;
    console.log(number)
    console.log(otp);
    client.verify.v2.services(serviceSid)
    .verificationChecks
    .create({
      to:'+91'+number,
      code: otp
    })
    .then( async (verification)=>{
      console.log("GET VARIFICATION");
      console.log(verification,"otp verification status")
      if(verification.valid === true){
        console.log("otp valid")
        const { username, email, number, password } = req.session.userData;       
        const newUser = new User({
          username,
          email,
          number,
          password,
        });
        await newUser.save();
        req.session.user = newUser;
        res.redirect('/');
      }
      else{
        res.render('user/OTP', { email: req.session.userData.email, error: 'Invalid OTP. Please try again.' });
      }
    })
    .catch((error)=>{
      console.log(error)
    })
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
  },


  getProductDetails: async(req, res) => {
    try{
      const productId = req.query.productId
      // console.log(productId);
      const productData = await Product.findById(productId).populate('category');
      console.log(productData);
      const category = await Category.find()

      let user = req.session.user
      res.render('shop/productpage', {productData});
    }catch(error) {
      throw new Error(error);
    }
  }
}

 

 
