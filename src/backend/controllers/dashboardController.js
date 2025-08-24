const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product'); // Giả sử model Product của bạn ở đây

const getOrderStatistics = async (req, res) => {
  try {
    // 1. Lấy tổng số đơn hàng
    const totalOrders = await Order.countDocuments();

    // 2. Dùng Aggregation để đếm số lượng đơn hàng theo từng trạng thái
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status', // Nhóm theo trường 'status'
          count: { $sum: 1 } // Đếm số document trong mỗi nhóm
        }
      },
      {
        $project: {
          _id: 0, // Bỏ trường _id
          status: '$_id', // Đổi tên _id thành status
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      totalOrders,
      statusCounts
    });

  } catch (error) {
    console.error('Lỗi khi thống kê đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thống kê đơn hàng' });
  }
};

const getRevenueStatistics = async (req, res) => {
  try {
    // Lấy khoảng thời gian từ query params (ví dụ: period=monthly)
    const period = req.query.period || 'monthly'; // Mặc định là theo tháng

    const matchStage = {
      status: 'Hoàn thành' // Chỉ tính doanh thu cho đơn hàng đã hoàn thành
    };

    let groupStage = {};

    if (period === 'daily') {
      // Nhóm theo ngày, tháng, năm
      groupStage = {
        _id: {
          year: { $year: "$created_at" },
          month: { $month: "$created_at" },
          day: { $dayOfMonth: "$created_at" }
        },
        totalRevenue: { $sum: "$total_amount" }
      };
    } else { // Mặc định là 'monthly'
      // Nhóm theo tháng, năm
      groupStage = {
        _id: {
          year: { $year: "$created_at" },
          month: { $month: "$created_at" }
        },
        totalRevenue: { $sum: "$total_amount" }
      };
    }

    const revenueData = await Order.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } } // Sắp xếp theo thời gian
    ]);

    res.status(200).json({ success: true, data: revenueData });

  } catch (error) {
    console.error('Lỗi khi thống kê doanh thu:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thống kê doanh thu' });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topProducts = await Order.aggregate([
      // Giai đoạn 1: Chỉ lấy các đơn hàng đã 'Hoàn thành'
      { $match: { status: 'Hoàn thành' } },

      // Giai đoạn 2: Tách mỗi sản phẩm trong mảng 'items' ra thành một document riêng
      { $unwind: '$items' },

      // Giai đoạn 3: Nhóm các sản phẩm giống nhau lại và tính toán
      {
        $group: {
          _id: '$items.product', // Nhóm theo ID của sản phẩm gốc
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { 
            $sum: { 
              $multiply: [ '$items.quantity', '$items.priceAtTime' ] 
            } 
          }
        }
      },


      // Giai đoạn 4: Sắp xếp theo số lượng bán được nhiều nhất
      { $sort: { totalQuantitySold: -1, totalRevenue: -1 } },

      // Giai đoạn 5: Giới hạn số lượng kết quả
      { $limit: limit },

      // Giai đoạn 6: Định dạng lại output cho đẹp
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },

      // Giai đoạn 7: Tách mảng productDetails
      { $unwind: '$productDetails' },

      // Giai đoạn 8: Định dạng lại output cuối cùng
      {
        $project: {
          _id: 0,
          name: '$productDetails.name',
          thumbnail: '$productDetails.thumbnail_url',
          totalQuantitySold: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.status(200).json({ success: true, data: topProducts });

  } catch (error) {
    console.error('Lỗi khi thống kê sản phẩm bán chạy:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Lỗi server khi thống kê sản phẩm bán chạy',
        error: error.message
    });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const lowStockItems = await Product.aggregate([
      // 1. Tách mảng 'variants'
      { $unwind: '$variants' },

      // 2. Tách mảng 'options'
      { $unwind: '$variants.options' },

      // 3. Lọc các option có số lượng tồn kho thấp
      {
        $match: {
          'variants.options.stock_quantity': { $lte: threshold }
        }
      },

      // 4. Định dạng lại kết quả để dễ đọc hơn
      {
        $project: {
          _id: 0,
          productName: '$name',
          variantName: '$variants.name',
          optionValue: '$variants.options.value', // ví dụ: "Size M", "4U"
          sku: '$variants.options.sku_code',
          stock: '$variants.options.stock_quantity'
        }
      }
    ]);

    res.status(200).json({ success: true, count: lowStockItems.length, data: lowStockItems });

  } catch (error) {
    console.error('Lỗi khi lấy cảnh báo tồn kho:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy cảnh báo tồn kho' });
  }
};

module.exports = {
  getOrderStatistics,
  getRevenueStatistics,
  getTopSellingProducts,
  getLowStockAlerts
};