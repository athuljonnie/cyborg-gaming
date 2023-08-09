let User = require('../models/userModel');
let Product = require('../models/productModels');
let Category = require('../models/categoryModels');

module.exports ={
    accountDetails : async(req, res) => {
        try{
            let loggedInUserId = req.session.user
            console.log(loggedInUserId);
            const userData= await User.findById(loggedInUserId);
            const categoryData = await Category.find()
            res.render('shop/userprofilepage', {userData, categoryData});
        }catch(error){
            throw new Error(error)
        }
    
    },
 }

