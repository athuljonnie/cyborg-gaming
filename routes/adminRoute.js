const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const isloggedInadmin = require("../middlewares/sessionHandling");
const multer = require("multer");
const Product = require("../models/productModels");
const adminOrderController = require("../controller/adminOrderController");
const dashboardcontroller = require("../controller/dashboardcontroller");
const couponController = require("../controller/couponController");
const offerController = require("../controller/offerController");
const orderController = require("../controller/orderController");
const salesController = require("../controller/salesController");
const sharp = require('sharp');
const PATH = require('path')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const adminRedirection = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect("/admin/login")
  }
};

router.get("/", isloggedInadmin, dashboardcontroller.dashBoard);

router.get("/login", isloggedInadmin, adminController.AdminloginPage);

router.post("/login", isloggedInadmin, adminController.AdminLoginPost);

router.get("/logout", isloggedInadmin, adminController.AdminlogoutGet);

router.get("/products", isloggedInadmin, adminController.Products);

router.get("/addproducts", adminRedirection, isloggedInadmin, adminController.AddProductsGet);

router.post("/addproducts", adminRedirection, upload.array("productImage", 3), async (req, res) => {




  const uploadedImages = [];
  for (const file of req.files) {
    const uploadedImage = file.path;


    const croppedImage = `public/uploads/ropped-${file.filename}`;
    try {
      await sharp(uploadedImage)
        .resize(400, 400)
        .toFile(croppedImage);
      uploadedImages.push(croppedImage);
    } catch (err) {
      console.error("Error processing image:", err);
    }

  }

  function removePathPrefix(imagesArray) {
    return imagesArray.map(image => image.replace('public/uploads/', ''));
  }

  const sanitizedImages = removePathPrefix(uploadedImages);


  const newProduct = new Product({
    productName: req.body.productName,
    productBrand: req.body.productBrand,
    productPrice: req.body.productPrice,
    productDescription: req.body.productDescription,
    productImage: sanitizedImages,
    category: req.body.category,
    productQuantity: req.body.productQuantity,
    originalPrice: req.body.originalPrice,
  });

  try {
    const savedProduct = await newProduct.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).json({ error: "Failed to save product" });
  }
});


router.get("/editproducts", adminRedirection, isloggedInadmin, adminController.getEditProducts);

router.post("/editproducts/:productId", adminRedirection, isloggedInadmin, upload.array("productImage", 3), async (req, res) => {
  try {
    const productId = req.params.productId;
    const productData = await Product.findById(productId);

    if (!productData) {
      throw new Error("Product not found");
    }

    const uploadedImages = [];
    for (const file of req.files) {
      const uploadedImage = file.path;

      const croppedImage = `public/uploads/ropped-${file.filename}`;
      try {
        await sharp(uploadedImage)
          .resize(400, 400)
          .toFile(croppedImage);
        uploadedImages.push(croppedImage);
      } catch (err) {
        console.error("Error processing image:", err);
      }
    }

    function removePathPrefix(imagesArray) {
      return imagesArray.map(image => image.replace('public/uploads/', ''));
    }

    const sanitizedImages = removePathPrefix(uploadedImages);

    productData.productName = req.body.productName;
    productData.productBrand = req.body.productBrand;
    productData.productPrice = req.body.productPrice;
    productData.productDescription = req.body.productDescription;
    const selectedCategoryId = req.body.category;
    productData.category = selectedCategoryId;
    productData.productQuantity = req.body.productQuantity;
    productData.originalPrice = req.body.originalPrice;

    await productData.save();

    console.log("Product updated:", productData);
    res.redirect("/admin/products");

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.get("/deleteProducts", isloggedInadmin, adminController.deleteProducts);

router.get("/blockproducts", isloggedInadmin, adminController.getBlockProduct);

router.get("/unblockproducts", isloggedInadmin, adminController.getUnblockProduct);

router.get("/categories", isloggedInadmin, adminController.Category);

router.get("/addcategories", isloggedInadmin, adminController.AddCategoryGet);

router.post("/addcategories", isloggedInadmin, adminController.AddCategoryPost);

router.get("/blockcategories", isloggedInadmin, adminController.getBlockCategories);

router.get("/unblockcategories", isloggedInadmin, adminController.getUnblockCategories);

router.get("/editcategories", isloggedInadmin, adminController.getEditCategories);

router.post("/editcategories/:categoryId", isloggedInadmin, adminController.postEditCategories);

router.get("/blockusers", isloggedInadmin, adminController.getBlockUsers);

router.get("/unblockusers", isloggedInadmin, adminController.getUnblockUsers);

router.get('/getorders', adminOrderController.getOrders);

router.post('/update-deliverystatus/:orderId', adminOrderController.updateOrderStatus);

router.get('/orderdetails', adminOrderController.getOrderDetails);

router.get("/users", isloggedInadmin, adminController.getAllUsers);

router.get('/coupon', couponController.coupon);

router.post('/createCoupon', couponController.createCoupon);

router.get('/offers', offerController.getOffers);

router.post('/categoryOffer', offerController.categoryOffer);

router.post('/productoffer', offerController.productOffers);

router.get('/removeOffer', offerController.getRemoveOffers);

router.get('/removeCatOffer', offerController.removeCatOffers);

router.post('/approval', orderController.cancelOrReturnApproval);

router.get('/removecoupon', couponController.removeCoupon);

router.get('/salesReport', adminRedirection, salesController.salesReport)

router.get('/salesReport/search', salesController.getSalesReport);

module.exports = router;
