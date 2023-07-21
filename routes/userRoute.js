const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const isLoggedIn  = require("../middlewares/sessionHandling");
// const isLoggedInUser = require('../middlewares/sessionHandling');

router.get("/", userController.homePage);

router.get("/login", isLoggedIn, userController.loginPage);

router.get("/signup", isLoggedIn, userController.signUpPage);

router.post("/signup", userController.signUpPost);

router.post("/login", isLoggedIn, userController.loginPost);

router.get("/logout", userController.logOutGet);


module.exports = router;
