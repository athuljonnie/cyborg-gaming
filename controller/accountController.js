let User = require('../models/userModel');
let Product = require('../models/productModels');
let Category = require('../models/categoryModels');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');

module.exports ={
    accountDetails : async(req, res) => {
        try{
            let loggedInUserId = req.session.user
    
            const userData= await User.findById(loggedInUserId);
            const categoryData = await Category.find()
            const addressData = await Address.findOne({userId : loggedInUserId});
            const userOrders = await Order.find({userId : loggedInUserId});
            console.log(userOrders,"❤️❤️❤️");
            res.render('shop/userprofilepage', {userData, categoryData, addressData, userOrders});
        }catch(error){
            throw new Error(error)
        }
    
    },
 }

