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
   number: {
      type: String,
      required: true,

    },
    isActive: {
      type: Boolean,
      default: true
    },
    

    
    
  });


const User = mongoose.model('User', UserSchema);
module.exports = User;