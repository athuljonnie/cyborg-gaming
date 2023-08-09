const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
      },
  addresses: [{
    fullname: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    house: {
      type: String,
      required: true
    },
    landmark: {
      type: String
    },
    city: {
      type: String,
      required: true
    },
    zip: {
      type: Number,
      required: true
    },

    number:{
        type: Number,
        required: true,
    },

    email: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
  
}]
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;