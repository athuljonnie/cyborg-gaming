const Product = require("../models/productModels");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModels");
const Wishlist =  require("../models/wishlistModel");


module.exports = {
getWishList: async(req, res) =>{
    try {
        const loggedInUserId = req.session.user; 
        console.log("One moree")
        const categoryData = await Category.find()
        const wishlistItems = await Wishlist.find({ userId: loggedInUserId });
        console.log(wishlistItems.length, "Wishlist Items");
        if(!loggedInUserId){
          res.redirect('/login')
        }else{
        res.render('shop/wishlist', { wishlistItems, user: loggedInUserId , userLayout:true, categoryData });
        }
      } catch (err) {
        console.log(err);
        res.render('error');
      }
    },

   wishlistLoad: async (req, res) => {
      try {
        const productId = req.query.productId;
        const product = await Product.findById(productId).populate('category')
        console.log(product,"❤️");
        const loggedInUserId = req.session.user;
        let wishlistItem = await Wishlist.findOne({ userId: loggedInUserId });
        console.log(wishlistItem);
        
       
    
        if (wishlistItem) {
            wishlistItem.products.push({
                prodId:productId,
                productName: product.productName,
                category: product.categoryName,
                price: product.productPrice,
                image: product.productImage
             
              });
        } else {
          const newWishlist = new Wishlist({
            userId: loggedInUserId,
            products: [{
                prodId:productId,
                productName: product.productName,
                category: product.categoryName,
                price: product.productPrice,
                image: product.productImage
      
            }]
          });
         wishlistItem = await newWishlist.save();
        }
  
        // cartItem.totalAmount = updatedTotalAmount;
        await wishlistItem.save();
        res.json({ success: true });
      } catch (error) {
        console.log(error);
        res.json({ success: false, error: "Error adding product to Wishlist" });
      }
    },

}