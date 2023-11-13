const Coupon = require('../models/couponModel');
const couponCode = require('coupon-code');
const Cart = require('../models/cartModel');
const usedCoupon = require('../models/usedCouponModel');
const Order = require('../models/orderModel');
module.exports = {
  coupon: async (req, res) => {
    try {
      const approvalRequests = await Order.find({
        $or: [{ returnrequest: true }, { cancellationrequest: true }],
      })
      const requestCount = await Order.countDocuments({
        $or: [{ returnrequest: true }, { cancellationrequest: true }],
      });
      const coupon = await Coupon.find()
      res.render("admin/couponManagement", {
        coupon, approvalRequests,
        requestCount
      });


    } catch (error) {
      console.log(error);
    }
  },

  createCoupon: async (req, res) => {
    try {
      const priceRange = req.body.priceRange;
      const discountAmount = req.body.discountAmount;
      const expirationDate = req.body.expirationDate;

      const options = {
        parts: 3,
        partLen: 4,
        pattern: 'LCN',
      };
      let coupon = couponCode.generate(options);


      const coupons = new Coupon({
        couponCode: coupon,
        priceRange: priceRange,
        discountAmount: discountAmount,
        expirationDate: expirationDate,
      })
      await coupons.save()


      res.redirect("/admin/coupon");
    } catch (err) {
      console.error(err);
      res.render('error');
    }
  },

  removeCoupon: async (req, res) => {
    let couponId = req.query.couponId
    try {
      const query = { _id: couponId };


      await Coupon.deleteOne(query)
      res.redirect("/admin/coupon")

    } catch (error) {
      console.log(error);
    }
  },

  checkCoupon: async (req, res) => {
    try {
      const couponCode = req.body.couponCode;
      const totalPrice = req.body.totalPrice;
      const loggedInUserId = req.session.user;

      const coupon = await Coupon.findOne({ couponCode: couponCode });
      let cartItem = await Cart.findOne({ user: loggedInUserId });

      let usedCoupons = await usedCoupon.findOne({ userId: loggedInUserId });

      const usedCouponCodes = usedCoupons ? usedCoupons.usedCoupon.map(item => item.couponCodes) : [];
      if (coupon) {
        const priceRange = coupon.priceRange;


        if (totalPrice >= priceRange && !usedCouponCodes.includes(couponCode)) {
          cartItem.offerPrice = totalPrice - coupon.discountAmount;
          let offer = cartItem.offerPrice

          cartItem.totalAmount = offer
          cartItem.discountCode = couponCode;
          cartItem.couponDiscount = coupon.discountAmount;
          cartItem.cartOffer = true;
          await cartItem.save();
          res.status(200).json({ success: true, cartItem });
        } else {
          let error = "Buy more products to apply this coupon";
          res.status(400).json({ success: false, error: error });
        }
      } else {
        let error = "Invalid Coupon";
        res.status(400).json({ success: false, error: error });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }


  }
}