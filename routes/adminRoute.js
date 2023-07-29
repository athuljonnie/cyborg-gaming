const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const isloggedInadmin = require("../middlewares/sessionHandling");
const multer = require("multer");
const Product = require("../models/productModels");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
router.get("/", isloggedInadmin, adminController.AdminHomePage);

router.get("/login", isloggedInadmin, adminController.AdminloginPage);

router.post("/login", isloggedInadmin, adminController.AdminLoginPost);

router.get("/logout", isloggedInadmin, adminController.AdminlogoutGet);

router.get("/products", isloggedInadmin, adminController.Products);

router.get("/addproducts", isloggedInadmin, adminController.AddProductsGet);

router.post("/addproducts", upload.array("productImage", 3), (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new Error("No files uploaded");
  }
  const uploadedImages = req.files.map((file) => file.filename);
  const newProduct = new Product({
    productName: req.body.productName,
    productBrand: req.body.productBrand,
    productPrice: req.body.productPrice,
    productDescription: req.body.productDescription,
    productImage: uploadedImages,
    category: req.body.category,
    productQuantity: req.body.productQuantity,
    originalPrice: req.body.originalPrice,
  });

  newProduct
    .save()
    .then((savedProduct) => {
      console.log("Product added to the database:", savedProduct);
      res.redirect("addproducts");
    })
    .catch((err) => {
      console.error("Error saving product:", err);
      res.status(500).json({ error: "Failed to save product" });
    });
});

router.get("/editproducts", isloggedInadmin, adminController.getEditProducts);

router.post("/editproducts/:productId", isloggedInadmin, upload.array("productImage", 3), async (req, res) => {
  try {
    const productId = req.params.productId;
    const productData = await Product.findById(productId);

    if (!productData) {
      throw new Error("Product not found");
    }

    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map((file) => file.filename);
      productData.productImage = uploadedImages;
    }

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
    res.redirect("/admin/products"); // Redirect to the product list page after updating.

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

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


router.get("/users", isloggedInadmin, adminController.getAllUsers);

module.exports = router;
