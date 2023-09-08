const Cart = require("../models/cartModel");
const Category = require("../models/categoryModels");
const Product = require("../models/productModels");
const User = require("../models/userModel");

Product.schema.index({ productName: 'text' });
Category.schema.index({ category: 'text' });
module.exports = {
  // --------filterProducts----------

  getAllProducts: async (req, res) => {

    try {
    const categoryData = await Category.find();
    let user = req.session.user;
    console.log(req.body.sortOption,'🫂🫂');

    if(req.body.sortOption === 'price-high-to-low'){

    const products = await Product.find().populate("category").sort("-productPrice");
    res.render("shop/allproducts", { products, user, categoryData });

    } else if (req.body.sortOption=== "price-low-to-high"){

    console.log(req.body.sortOption);
    const products = await Product.find().populate("category").sort("productPrice");
    res.render("shop/allproducts", { products, user, categoryData });


    } else if(req.body.sortOption === 'a-z'){

    const products = await Product.find().populate("category").sort("productName");
    res.render("shop/allproducts", { products, user, categoryData });

    } else {

    const products = await Product.find().populate("category")
    res.render("shop/allproducts", { products, user, categoryData });

    }

    } catch (error) {
      throw new Error("Cant find Products");
    }
  },

  
  
  getSearch: async(req, res) =>{

try {
    const searchTerm = req.query.searchTerm;

        const categories = await Category.find();
        let products = [];
        console.log(searchTerm,'SDHASDH');     
        if (searchTerm) {
         
            const categoryData = await Category.find({ $text: { $search: searchTerm } });
            const products = await Product.find({ $text: { $search: searchTerm } });
      
          console.log(categoryData, products,'😁😁😁');
            const categoryIds = categoryData .map((category) => category._id);
            const productIds = products.map((product) => product._id);
      
          
            products = await Product.find({
              $or: [
                { category: { $in: categoryIds } },
                { _id: { $in: productIds } }
              ]
            })
              .populate('category')
          }
      
          let user = req.session.user;
          res.render('shop/searchresults', {
            categoryData,
            products,
            searchTerm,
            user
          });
} catch (error) {
    throw new Error('no products found')
}

  }
  
};
