const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
  // Define fields for each transaction entry
  amount: {
    type: Number,
  },
  description: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});



const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wallet: {
    type: Number,
    default: 0, 
    required: true
  },
  transactions: [transactionSchema],
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;