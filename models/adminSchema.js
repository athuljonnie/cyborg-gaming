const mongoose = require('mongoose'); 

const adminSchema = new mongoose.Schema({
    admin: {
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
 
    isActive: {
      type: Boolean,
      default: true
    },
    

    
    
  });
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;