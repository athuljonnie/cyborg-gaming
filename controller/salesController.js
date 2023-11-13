const Order = require('../models/orderModel');
const Wallet = require('../models/walletSchema');
const Category = require('../models/categoryModels');
const Product = require('../models/productModels')
exports.salesReport = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        '$unwind': {
          'path': '$products'
        }
      }, {
        '$match': {
          'deliverystatus': 'delivered',
          'orderstatus': {
            '$ne': 'returned'
          }
        }
      }, {
        '$lookup': {
          'from': 'products',
          'localField': 'products.name',
          'foreignField': 'productName',
          'as': 'productsDetails'
        }
      }, {
        '$unwind': {
          'path': '$productsDetails'
        }
      }, {
        '$lookup': {
          'from': 'categories',
          'localField': 'productsDetails.category',
          'foreignField': '_id',
          'as': 'category'
        }
      }, {
        '$unwind': {
          'path': '$category'
        }
      }
    ]).exec();

    const categories = await Category.find()
    res.render('admin/salesReport', { admin: true, orders, categories })
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

exports.salesForm = async (req, res) => {
  try {

    res.render('admin/admin-panel/sales-report');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const orders = await Order.aggregate([
      {
        '$unwind': {
          'path': '$products'
        }
      }, {
        $match: {
          'deliverystatus': 'delivered',
          'deliveredAt': {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          'orderstatus': { $nin: ['returned', 'cancelled'] }
        }
      }, {
        '$lookup': {
          'from': 'products',
          'localField': 'products.name',
          'foreignField': 'productName',
          'as': 'productsDetails'
        }
      }, {
        '$unwind': {
          'path': '$productsDetails'
        }
      }, {
        '$lookup': {
          'from': 'categories',
          'localField': 'productsDetails.category',
          'foreignField': '_id',
          'as': 'category'
        }
      }, {
        '$unwind': {
          'path': '$category'
        }
      }
    ]).exec();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};


