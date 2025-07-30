const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/ProductModel'); // Giả sử model Product của bạn ở đây

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
      { $match: { status: 'Hoàn thành' } },
      { $unwind: '$items' },
      {
        // Nhóm theo SKU để có thống kê chính xác nhất
        $group: {
          _id: { 
            sku: '$items.sku_code',
            name: '$items.variant_name',
            thumbnail: '$items.thumbnail_url'
          },
          totalQuantitySold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
      {
        // Định dạng lại output
        $project: {
          _id: 0,
          sku: '$_id.sku',
          name: '$_id.name',
          thumbnail: '$_id.thumbnail',
          totalQuantitySold: 1
        }
      }
    ]);

    res.status(200).json({ success: true, data: topProducts });

  } catch (error) {
    console.error('Lỗi khi thống kê sản phẩm bán chạy:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thống kê sản phẩm bán chạy' });
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