const Address = require("../models/addressModel");
const User = require("../models/userModel");
const Product = require("../models/productModels");

module.exports = {
  getAddress: async (req, res) => {
    try {
      let loggedInuserId = req.session.user;
      let userData = User.findById({ user: loggedInuserId });
      res.render("shop/address", { userData });
    } catch (error) {
      throw new Error(error);
    }
  },


  postAddress: async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      if (!loggedInUserId) {
        const error = "User is not logged";
        return res.redirect("/");
      }
  
      console.log(req.body,req.query, "reqbody")
      const userAddresses = await Address.findOne({ userId: loggedInUserId });
      let addresses;
  
      if (userAddresses) {
        addresses = userAddresses.addresses;
      } else {
        addresses = [];
      }
  
    
  
      const newAddress = {
        fullname: req.body.fullname,
        state: req.body.state,
        house: req.body.house,
        landmark: req.body.landmark,
        city: req.body.city,
        zip: req.body.zip,
        number: req.body.number,
        email: req.body.email,
        type: req.body.type,
 
      };
  
      addresses.push(newAddress);
  
      if (userAddresses) {
        await userAddresses.save();
      } else {
        // If the user doesn't have any addresses, create a new document
        console.log("new user");
          const newAddressDocument = new Address({
          userId: loggedInUserId,
          addresses: [newAddress],
        });
        // Save the newAddressDocument
        const savedAddress = await newAddressDocument.save();
      }
      
 res.redirect('/precheckout')

    } catch (error) {
      console.error('Error saving address:', error);
      res.status(500).json({ error: 'Error saving address.' });
    }
  },

  
};
