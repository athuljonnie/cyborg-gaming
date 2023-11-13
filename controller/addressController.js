const Address = require("../models/addressModel");
const User = require("../models/userModel");
const Product = require("../models/productModels");
const Category = require("../models/categoryModels");
const Cart = require("../models/cartModel");
module.exports = {
  viewAddress: async (req, res) => {
    try {
      let loggedInUserId = req.session.user
      const addresses = await Address.findOne({ userId: loggedInUserId });
      let categoryData = await Category.find()
      let user = await User.findById(loggedInUserId)
      if (loggedInUserId) {
        res.render('shop/showAddresses', { addresses, categoryData, user })
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.log(error);
    }
  },

  getAddress: async (req, res) => {
    try {

      let source = req.query.source;
      let loggedInuserId = req.session.user;
      let cartItems = await Cart.find(loggedInuserId)
      let userData = User.findById({ user: loggedInuserId });
      res.render("shop/address", { userData, source, cartItems });
    } catch (error) {
      throw new Error(error);
    }
  },


  postAddress: async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      const source = req.query.source;
      if (!loggedInUserId) {
        const error = "User is not logged";
        return res.redirect("/");
      }
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
        const newAddressDocument = new Address({
          userId: loggedInUserId,
          addresses: [newAddress],
        });
        const savedAddress = await newAddressDocument.save();
      }
      if (source === "account") {
        res.redirect('/viewAddress')
      } else {
        res.redirect('/precheckout')
      }
    } catch (error) {
      console.error('Error saving address:', error);
      res.status(500).json({ error: 'Error saving address.' });
    }
  },


  getEditAddress: async (req, res) => {
    try {
      const addressId = req.query.address;
      let account = req.query.account;
      let source = req.query.source;

      const loggedInUserId = req.session.user;    
      const userAddresses = await Address.find({ userId: loggedInUserId });

      if (!userAddresses) {
        throw new Error("User has no addresses");
      }

      let addressToEdit;
      for (const address of userAddresses) {
        addressToEdit = address.addresses.find((a) => a._id.toString() === addressId);
        if (addressToEdit) {
          break;
        }
      }

      res.render("shop/editaddress", { user: loggedInUserId, addressToEdit, error: null, account, source });

    } catch (error) {
      console.log(error);
    }
  },


  postEditAddress: async (req, res) => {
    try {
      const Account = req.query.account;
     
      const addressId = req.query.address;
      const loggedInUserId = req.session.user;
      const source = req.query.source;
    
      if (!loggedInUserId) {
        error = "User is not logged in";
        res.redirect('/login');
      }
      const userAddresses = await Address.findOne({ userId: loggedInUserId });
      const editAddress = userAddresses.addresses.find(a => a._id.toString() === addressId);

      if (!editAddress) {
        throw new Error("Address not found");
      }

      const setDefault = req.body.setDefault === 'on';

      editAddress.default = setDefault;

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


      await userAddresses.save();

      if (Account == 0) {
        res.render('shop/404');
      } else {
        if (source === "account") {
          res.redirect('/viewAddress')
        } else {
          res.redirect('/precheckout')
        }
      }
    } catch (err) {
      console.log(err);
    }
  },


  addressDelete: async (req, res) => {
    try {
      const userId = req.session.user;
      const addressId = req.params.addressId;
      let addressIdToDelete = addressId._id;


      let userAddresses = await Address.find({ userId: userId });
      if (!userAddresses) {
        throw new Error("user addresses not found!");
      }
      let addressToDelete;
      for (const address of userAddresses) {
        addressToDelete = address.addresses.find((a) => a._id.toString() === addressId);
        if (addressToDelete) {
          break;
        }
      }
    
      if (addressToDelete) {
        userAddresses.forEach((userAddress) => {
          const indexToDelete = userAddress.addresses.findIndex((a) =>
            a._id.toString() === addressId
          );
          if (indexToDelete !== -1) {
            userAddress.addresses.splice(indexToDelete, 1);
          }
        });

        await Promise.all(userAddresses.map((userAddress) => userAddress.save()));

      
        res.redirect("/viewAddress")
      } else {
        console.log('Address not found');
      }


    } catch (error) {
      console.error(error);

      res.status(500).json({ error: 'Internal server error' });
    }
  }


};
