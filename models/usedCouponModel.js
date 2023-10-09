const mongoose = require('mongoose');
const usedcouponSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
  usedCoupon: [
    {
    couponCodes:{
    type: String
    }
      
    }
  ]
});
const Usedcoupons = mongoose.model('Usedcoupons', usedcouponSchema);
module.exports = Usedcoupons;
