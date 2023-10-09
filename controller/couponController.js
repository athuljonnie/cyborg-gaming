const Coupon = require ('../models/couponModel');
const couponCode = require('coupon-code');
const Cart = require('../models/cartModel');
const usedCoupon = require('../models/usedCouponModel');

module.exports = {
    coupon: async (req, res) => {
try {
    const coupon = await Coupon.find()
      res.render("admin/couponManagement", { adminLayout: true , coupon});


} catch (error) {
    console.log(error);
}
},

createCoupon: async(req, res) => {
    try {
        const priceRange = req.body.priceRange;
        const discountAmount = req.body.discountAmount;
        const expirationDate = req.body.expirationDate;
    console.log(req.body,"🐱‍🚀");
        // Generate the coupon code
        const options = {
          parts: 3,
          partLen: 4,
          pattern: 'LCN',
        };
        let coupon = couponCode.generate(options);
        console.log(coupon,"😃");
      
    
       const coupons = new Coupon({
          couponCode: coupon,
          priceRange: priceRange,
          discountAmount: discountAmount,
          expirationDate: expirationDate,
       })
       console.log(coupons,"🐱‍👤🐱‍👤");
       await coupons.save()
      
    
        res.redirect("/admin/coupon");
      } catch (err) {
        console.error(err);
        res.render('error');
      }
    },

removeCoupon: async(req, res) => {
  let couponId =  req.query.couponId
try {
  const query = { _id: couponId };
  
  console.log('couponId: ', couponId);

  await Coupon.deleteOne(query)
  res.redirect("/admin/coupon")

} catch (error) {
  console.log(error);
}
},

    checkCoupon: async(req, res) =>{
      try {
        const couponCode = req.body.couponCode;
        console.log("coupon Code: " , couponCode);
        const totalPrice = req.body.totalPrice;
        const loggedInUserId = req.session.user;
        console.log(totalPrice,'💕💕💕', couponCode);
   
        const coupon = await Coupon.findOne({ couponCode: couponCode });
        console.log(coupon, "coupon")
        let cartItem = await Cart.findOne({ user: loggedInUserId });

        console.log(cartItem,"cartItem");
        let usedCoupons = await usedCoupon.findOne({ userId: loggedInUserId });
        
        console.log(usedCoupons, "usedCoupons");
        const usedCouponCodes = usedCoupons ? usedCoupons.usedCoupon.map(item => item.couponCodes) : [];
        console.log(usedCouponCodes);
          if (coupon) {
          const priceRange = coupon.priceRange;

          console.log(priceRange,"💕1");
          console.log(cartItem.totalAmount, "totalAmount");
          console.log(cartItem.cartOffer, "cart Offer");
          // && !usedCouponCodes.includes(couponCode)__________ do not forget after debugging
          if (totalPrice >= priceRange && !usedCouponCodes.includes(couponCode)) {
            cartItem.offerPrice= totalPrice - coupon.discountAmount;
            let offer = cartItem.offerPrice
            console.log(cartItem.totalAmount,'😶‍🌫️😶😶‍🌫️');
            cartItem.totalAmount = offer
            cartItem.discountCode = couponCode;
            cartItem.couponDiscount = coupon.discountAmount;
            cartItem.cartOffer = true;
            console.log(cartItem.cartOffer, "cart Offer");
            console.log(cartItem, "cartItem with discountCode 😎");
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