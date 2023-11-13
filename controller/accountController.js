let User = require('../models/userModel');
let Product = require('../models/productModels');
let Category = require('../models/categoryModels');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Wishlist = require('../models/wishlistModel');
const Wallet = require('../models/walletSchema');
const Coupon = require('../models/couponModel');
module.exports = {
    accountDetails: async (req, res) => {
        try {
            let loggedInUserId = req.session.user
            let id = loggedInUserId._id

            let cart = await Cart.find({ user: loggedInUserId }).populate({ path: "products.productId", model: "Product" });
            const wishlistItems = await Wishlist.find({ user: loggedInUserId }).populate({ path: "products.productId", model: "Product" });
            const coupons = await Coupon.find();
            const user = await User.findById(loggedInUserId);
            let wallet = await Wallet.findOne({ user: loggedInUserId });

            const categoryData = await Category.find()
            const addressData = await Address.findOne({ userId: loggedInUserId });
            const userOrders = await Order.find({ userId: loggedInUserId }).sort("-createdAt");
            if (loggedInUserId) {
                res.render('shop/userprofilepage', { user, categoryData, wishlistItems, addressData, userOrders, wallet, cart, coupons });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            throw new Error(error)
        }

    },
}

