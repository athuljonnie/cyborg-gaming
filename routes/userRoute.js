const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const cartController = require('../controller/cartController')
const isLoggedIn  = require("../middlewares/sessionHandling");
const productController = require('../controller/productController')
const accountController = require("../controller/accountController");
const addressController = require("../controller/addressController");
const orderController = require("../controller/orderController");


router.get("/",userController.homePage);

router.get('/allproducts', productController.getAllProducts);

router.post('/allproducts', productController.getAllProducts);  

router.get('/search', productController.getSearch);

router.get("/productdetails",userController.getProductDetails);

router.get('/cartload', cartController.cartLoad);

router.get('/removeCart', cartController.deleteCart);

router.post('/updateQuantity', cartController.postUpdateQuantity);

router.get('/cart', cartController.cart);

router.get("/login",isLoggedIn, userController.loginPage);

router.get("/signup", isLoggedIn, userController.signUpPage);

router.post("/signup", userController.signUpPost);

router.get("/verify",userController.getVerify);

router.post("/verify",userController.postVerify);

router.post("/login",  userController.loginPost);

router.get("/logout", userController.logOutGet);

router.get("/account", accountController.accountDetails);

router.get("/address", addressController.getAddress);

router.post("/address",addressController.postAddress);

router.get("/precheckout",userController.precheckout);

router.get("/order",orderController.placeOrder);

router.get("/getTotalPrice", orderController.getTotalPrice)

router.post("/updateDefaultAddress", userController.updateDefaultAddress);

router.post("/order", orderController.order);

router.post("/verify-payment", orderController.verifyPayment);

router.get('/category/desktop-pcs', userController.getProductsByCategory);

router.get('/deleteOrder', orderController.deleteOrder);




module.exports = router;
