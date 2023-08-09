const Product = require("../models/productModels");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModels");

module.exports = {
  cartLoad: async (req, res) => {
    try {
      const productId = req.query.productId;
      const loggedInUserId = req.session.user;
      // const totalAmount = parseFloat(req.body.cartTotalPrice);
      let cartItems = await Cart.find({ user: loggedInUserId }).populate({
        path: "products.productId",
        model: "Product",
      });
  //  console.log(cartTotalPrice);
      
      let cartItem = cartItems[0];

      if (cartItem) {
        const existingProductIndex = cartItem.products.findIndex(
          (item) => item.productId._id.toString() === productId
        );
        console.log(existingProductIndex, "existing index");
        if (existingProductIndex !== -1) {
          cartItem.products[existingProductIndex].quantity += 1;
        } else {
          cartItem.products.push({
            productId: productId,
            quantity: 1,
          });
        }
      } else {
        const newCartItem = new Cart({
          user: loggedInUserId,
          products: [
            {
              productId: productId,
              quantity: 1,
            },
          ],
          // totalAmount: totalAmount,
        });
        cartItem = await newCartItem.save();
      }

      // cartItem.totalAmount = updatedTotalAmount;
      await cartItem.save();
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ success: false, error: "Error adding product to cart" });
    }
  },

  cart: async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      const cartItems = await Cart.find({ user: loggedInUserId }).populate({
        path: "products.productId",
        model: "Product",
      });
      for (const cartItem of cartItems) {
        // for (const product of cartItem.products) {
        //   const fetchedProduct = await Product.findById(product.productId);
        //   product.stock = fetchedProduct.productQuantity;
        //   console.log(product.stock,"😍")
        //   await cartItem.save();
        // }
        // console.log(cartItem.products );
        cartItem.products = cartItem.products.filter(
          (product) => product.productQuantity !== 0
        );
      }
      //   const cartItems = cart.filter((cartItem) => cartItem.products.length > 0);
      const categoryData = await Category.find();
      if (!loggedInUserId) {
        res.redirect('/login')
      } else {
         res.render("shop/cart", {
          cartItems,
          user: loggedInUserId,
          use: true,
          categoryData,
        });
      }
    } catch (error) {
      res.render(error);
    }
  },

  deleteCart: async (req, res) => {
    try {
      const productId = req.query.productId;
      console.log(typeof productId);
      const loggedInUserId = req.session.user;
      const cartItem = await Cart.findOne({ user: loggedInUserId });
      // console.log(cartItem);
      if (cartItem) {
        console.log(cartItem.products[0]);
        const productIndex = cartItem.products.findIndex(
          (product) => product._id.toString() === productId
        );
 
        if (productIndex == -1) {
          cartItem.products.splice(productIndex, 1);
          await cartItem.save();
        }
        if(!cartItem.products.length){
          Cart.deleteOne({user: loggedInUserId }).then(res=>{
            console.log("removed sucessfully");
          })
        }
      }
      res.redirect("/cart");
    } catch (err) {
      console.log(err);
      res.render("error");
    }
  },

  postUpdateQuantity: async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const updatedProduct = await Cart.findOneAndUpdate(
        { "products._id": productId },
        { $set: { "products.$.quantity": quantity } },
        { new: true }
      );
      res.json({ success: true, message: "Quantity  updated successfully" });
    } catch (error) {
      console.error("Error updating quantity and price:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to update quantity and price",
        });
    }
  },
};
