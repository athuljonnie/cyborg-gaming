const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const cartController = require('../controller/cartController')
let User = require('../models/userModel');
const isLoggedIn  = require("../middlewares/sessionHandling");
const productController = require('../controller/productController')
const accountController = require("../controller/accountController");
const addressController = require("../controller/addressController");
const orderController = require("../controller/orderController");
const wishlistController = require("../controller/wishlistController");
const couponController = require("../controller/couponController");
const { UserContextImpl } = require("twilio/lib/rest/conversations/v1/user");

const checkBlockedUser = async (req, res, next) => {
    try {
      if (req.session.user) {
      
        const user = await User.findById(req.session.user._id);
       
        if (user.isBlocked) {
       
          req.session.user = null;
          return res.redirect('/');
        }
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  router.use(checkBlockedUser);

  const redirection = (req, res, next) => {
   if(req.session.user){
    next()
   }else{
    res.redirect("login")
   }
  };



router.get("/",userController.homePage);

router.get('/allproducts', productController.getAllProducts);

router.post('/allproducts', productController.getAllProducts);  

router.get('/search', productController.getSearch);

router.get("/productdetails",userController.getProductDetails);

router.get('/cartload', redirection,cartController.cartLoad);

router.get('/removeCart', redirection, cartController.deleteCart);

router.post('/updateQuantity', cartController.postUpdateQuantity);

router.get('/cart', redirection,cartController.cart);

router.get('/wishlist',redirection, wishlistController.getWishList)

router.get('/wishlistLoad', redirection, wishlistController.wishlistLoad)

router.get("/login", userController.loginPage);

router.get("/signup",isLoggedIn,userController.signUpPage);

router.post("/signup", userController.signUpPost);

router.get("/verify",userController.getVerify);

router.post("/verify",userController.postVerify);

router.post("/login",  isLoggedIn,userController.loginPost);

router.post("/changepassword",  userController.changePassword);

router.get("/getemail",  userController.getEmail);

router.post("/forgotpassword", userController.forgotPassword);

router.post("/verify-pass", userController.postForgotPasswordVerify);

router.post("/new-pass",  userController.postNewpassword);

router.get("/changepassword" ,  userController.getChangePassword);

router.get("/logout", userController.logOutGet);

router.get("/editUser", redirection, userController.getEditUser);

router.post("/editUser", userController.postEditUser);

router.get("/account",redirection, accountController.accountDetails);

router.get("/viewAddress", redirection, addressController.viewAddress);

router.get("/address", redirection, redirection,addressController.getAddress);

router.post("/address", redirection,addressController.postAddress);

router.get("/editaddress", redirection,addressController.getEditAddress);

router.post("/editaddress", redirection,addressController.postEditAddress);

router.get("/deleteaddress/:addressId", addressController.addressDelete);

router.get("/precheckout", redirection,userController.precheckout);

router.get("/order", redirection,orderController.placeOrder);

router.get("/getTotalPrice", orderController.getTotalPrice)

router.post("/updateDefaultAddress", userController.updateDefaultAddress);

router.post("/order", orderController.order);

router.post("/verify-payment", orderController.verifyPayment);

router.get('/category/desktop-pcs', userController.getProductsByCategory);

router.get('/deleteOrder', orderController.deleteOrder);

router.get('/orders', redirection,orderController.OrderDetails );

router.get('/orderdetails', redirection, orderController.getOrderDetails );

router.post('/cancelOrReturn', redirection, orderController.cancelOrReturn);

router.get('/ordersuccess', redirection, orderController.orderSuccess);

router.get('/createwallet', redirection, userController.createWallet);

router.get('/wishlist/remove' , redirection, wishlistController.removeFromWishlist);

router.post('/generateInvoice', redirection, orderController.generateInvoice);

router.get('/generateInvoice', redirection, orderController.generateInvoice);

router.post('/checkCoupon', redirection, couponController.checkCoupon);

// router.get('/downloadInvoice', orderController.InvoiceDownload);
module.exports = router;
