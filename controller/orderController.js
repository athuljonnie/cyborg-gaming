const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModels");

module.exports = {
  getTotalPrice: async (req, res) => {
    const loggedInUserId = req.session.user;
    const totalAmount = req.query.totalAmount;
    console.log(totalAmount);
    try {
      let cart = await Cart.findOne({ user: loggedInUserId });
      if (cart) {
        cart.totalAmount = totalAmount;
        await cart.save();
      } else {
        console.log("Cart not found");
      }
    } catch (error) {
      console.log(error);
    }
    res.json({ success: true });
  },

  placeOrder: async (req, res) => {
    const loggedInUserId = req.session.user;
    const cart = await Cart.find({ user: loggedInUserId });
    //    const address = await Address.findOne({addresses:})
  },

  order: async (req, res) => {
    let { addressId, paymentOption } = req.body;

    let userId = req.session.user._id;

    let cart = await Cart.findOne({ user: userId }).populate( {path: "products.productId",
    model: "Product",});

    const orderProducts = cart.products.map((product) => {
      return {
        name: product.productId.productName,
        quantity: product.quantity,
 
          };
    });
    let totalAmount = cart.totalAmount;
    console.log(orderProducts, "product");

    res.json({ hello: "world" });

    try {
      const deliveryAddress = await Address.findOne({
        "addresses._id": addressId,
      });
      let selectedAddress;
      if (deliveryAddress && deliveryAddress.addresses.length > 0) {
        selectedAddress = deliveryAddress.addresses.find(
          (address) => address._id.toString() === addressId
        );

        let newOrder = new Order({
          deliveryDetails: {
            Fullname: selectedAddress.fullname,
            state: selectedAddress.state,
            house: selectedAddress.house,
            landmark: selectedAddress.landmark,
            city: selectedAddress.city,
            zip: selectedAddress.zip,
            number: selectedAddress.number,
            email: selectedAddress.email,
            type: selectedAddress.type,
          },
          userId: userId,
          paymentMethod: paymentOption,
          products: orderProducts,
          totalAmount: totalAmount,
          paymentstatus: "cod",
          deliverystatus: "pending",
        });
        await newOrder.save();
      }

      res.json({success:true})
    } catch (error) {
      console.log(error);
    }
  },
};

// async function orderCreate(){
//     try {
//         const deliveryAddress = await Address.findOne(
//           { 'addresses._id': addressId }
//           );
//           if (deliveryAddress && deliveryAddress.addresses.length > 0) {
//             const selectedAddress = deliveryAddress.addresses.find((address) => address._id.toString() === addressId);
//             if (selectedAddress) {
//               console.log(selectedAddress);

//             }
//           }
// }catch(error) {
//     console.log(error);
// }}
