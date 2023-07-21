const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const isloggedInadmin = require("../middlewares/sessionHandling");



router.get("/", isloggedInadmin, adminController.AdminHomePage);

router.get("/login", isloggedInadmin,adminController.AdminloginPage);

router.post("/login", isloggedInadmin,adminController.AdminLoginPost);

router.get("/logout", isloggedInadmin, adminController.AdminlogoutGet);

router.get("/products",isloggedInadmin, adminController.Products);

router.get("/addproducts",isloggedInadmin, adminController.AddProducts);

router.get("/categories",isloggedInadmin, adminController.Category);

router.get("/addcategories",isloggedInadmin, adminController.AddCategoryGet);

router.post("/addcategories",isloggedInadmin, adminController.AddCategoryPost);



module.exports = router;