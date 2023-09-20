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


  getEditAddress : async(req, res) => {
   try {
    const addressId = req.query.address;
    let account = req.query.account
    console.log(account,"edit account from");
    console.log(addressId, "address id");
    const loggedInUserId = req.session.user;
    console.log(loggedInUserId);
    const userAddresses = await Address.find({ userId: loggedInUserId });
    console.log(userAddresses, "all addresses");
    if (!userAddresses) {
      // Addresses not found, handle the error or redirect to an error page
      throw new Error("User has no addresses");
    }

    let addressToEdit; 
    for (const address of userAddresses) {
      addressToEdit = address.addresses.find((a) => a._id.toString() === addressId);
      if (addressToEdit) {
        break;
      }
    }
    console.log(addressToEdit, "edit this address");

    console.log(addressToEdit.fullname,"username");
    res.render("shop/editaddress", { user: loggedInUserId,addressToEdit, error: null ,account});

   } catch (error) {
    console.log(error);
   }
  },


  postEditAddress: async(req,res) => {
    try {
      const Account = req.query.account;
      console.log(Account, "edit address from?????");
      const addressId = req.query.address;
      console.log(addressId,"😒😒");
      const loggedInUserId = req.session.user;
      if (!loggedInUserId) {
        error = "User is not logged in";
        res.redirect('/precheckout');
      }
      const userAddresses = await Address.findOne({ userId: loggedInUserId });
      const editAddress = userAddresses.addresses.find(a => a._id.toString() === addressId);
      
      if (!editAddress) {
        // Address not found, handle the error or redirect to an error page
        throw new Error("Address not found");
      }
      
      // Check if the edited address should be set as the default address
      const setDefault = req.body.setDefault === 'on';
      
      // Update the default property for the edited address
      editAddress.default = setDefault;
      
      // If the edited address is set as default, update the previous default address
      if (setDefault) {
        const previousDefault = userAddresses.addresses.find(a => a.default);
        if (previousDefault && previousDefault._id.toString() !== addressId) {
          previousDefault.default = false;
        }
      }
      
      editAddress.fullname = req.body.fullname;
      editAddress.state = req.body.state;
      editAddress.house = req.body.house;
      editAddress.landmark = req.body.landmark;
      editAddress.city = req.body.city;
      editAddress.zip = req.body.zip;
      editAddress.number = req.body.number;
      editAddress.email = req.body.email;
      editAddress.type = req.body.type;
  
      console.log("Edited address:", editAddress);
      await userAddresses.save();
  
      if (Account == 0) {
        res.render('shop/404');
      } else {
        // Pass the address ID as a query parameter
        res.redirect('/precheckout');
      }
    } catch (err) {
      console.log(err);
      // res.render('error');
    }
  }
  
  
};
