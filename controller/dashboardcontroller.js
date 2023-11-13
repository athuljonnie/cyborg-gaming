const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModels");
const Product = require("../models/productModels");

module.exports = {
  dashBoard: async (req, res) => {
    try {
      const orders = await Order.find();
      const codOrders = await Order.aggregate([
        { $match: { paymentMethod: "cod" } },
        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
      ]);

      const razorpayOrders = await Order.aggregate([
        { $match: { paymentMethod: "razorpay" } },
        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
      ]);

      const walletOrders = await Order.aggregate([
        { $match: { paymentMethod: 'wallet' } },
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
      ]);

      const categoryCounts = await Category.aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "category",
            foreignField: "products.category",
            as: "orders",
          },
        },
        {
          $project: {
            category: 1,
            count: {
              $sum: {
                $map: {
                  input: "$orders",
                  as: "order",
                  in: {
                    $sum: {
                      $map: {
                        input: "$$order.products",
                        as: "product",
                        in: {
                          $cond: [
                            { $eq: ["$$product.category", "$category"] },
                            "$$product.quantity",
                            0,
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ]);

      const productCounts = await Product.aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "productName",
            foreignField: "products.name",
            as: "orders",
          },
        },
        {
          $project: {
            productName: 1,
            image: 1,
            price: 1,
            category: 1,
            subcategory: 1,

            count: {
              $sum: {
                $map: {
                  input: "$orders",
                  as: "order",
                  in: {
                    $size: {
                      $filter: {
                        input: "$$order.products",
                        as: "product",
                        cond: [
                          { $eq: ["$$product.deliverystatus", "delivered"] },
                          "$$product.quantity",
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 1,
        },
      ]);



      const categories = categoryCounts.map(category => category.CategoryName);
      const counts = categoryCounts.map(category => category.count);
      const products = await Product.find()
        .populate('category', 'category');


      const codTotalAmount = codOrders.length > 0 ? codOrders[0].totalAmount : 0;
      const razorpayTotalAmount = razorpayOrders.length > 0 ? razorpayOrders[0].totalAmount : 0;
      const walletTotalAmount = walletOrders.length > 0 ? walletOrders[0].totalAmount : 0;


      const totalRevenue = codTotalAmount + razorpayTotalAmount;

      const numberOfDays = Math.ceil((Date.now() - orders[0].createdAt) / (1000 * 60 * 60 * 24));



      const approvalRequests = await Order.find({
        $or: [{ returnrequest: true }, { cancellationrequest: true }],
      })
      const requestCount = await Order.countDocuments({
        $or: [{ returnrequest: true }, { cancellationrequest: true }],
      });


      const dailyRevenue = totalRevenue / numberOfDays;

      const numberOfProducts = orders.reduce((count, order) => {
        const deliveredProducts = order.products.filter(product => product.orderstatus === 'delivered');
        return count + deliveredProducts.length;
      }, 0);

      const totalCustomers = await User.countDocuments();
      const totalOrder = await Order.countDocuments();
      const totalOrders = totalOrder + 1;

      const monthlyRevenue = calculateMonthlyRevenue(orders);
      if (!req.session.admin) {
        res.redirect('login')
      } else {
        res.render('admin/adminHome', {
          adminLayout: true,
          totalRevenue,
          totalOrders,
          dailyRevenue,
          numberOfProducts,
          totalCustomers,
          codTotalAmount,
          razorpayTotalAmount,
          walletTotalAmount,
          order: orders,
          monthlyRevenue,
          categories,
          counts,
          productCounts,
          products,
          approvalRequests,
          requestCount
        });
      }
    } catch (error) {
      console.log(error);
    }

    function calculateMonthlyRevenue(orders) {
      const monthlyRevenue = new Array(12).fill(0);

      orders.forEach((order) => {
        const month = order.createdAt.getMonth();
        monthlyRevenue[month] += order.totalAmount;
      });

      return monthlyRevenue;
    }
  },
}