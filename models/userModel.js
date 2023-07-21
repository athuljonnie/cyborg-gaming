const mongoose = require('mongoose'); 

const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phonenumber: {
      type: String,
      required: true,
      unique:true,
      // sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true
    },

    
    
  });


//Export the model
const User = mongoose.model('User', UserSchema);
module.exports = User;