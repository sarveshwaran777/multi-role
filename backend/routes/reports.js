const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { UserDb, OrderDb } = require('../utils/dbMock');
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// @desc    Get dashboard and analytics reports stats (accessible to all authenticated users for Dashboard rendering)
// @route   GET /api/reports/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    let users = [];
    let orders = [];

    if (process.env.USE_MOCK_DB === 'true') {
      users = await UserDb.find();
      orders = await OrderDb.find();
    } else {
      users = await User.find({});
      orders = await Order.find({});
    }

    const totalUsers = users.length;
    const totalOrders = orders.length;

    // Calculate status counts
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const processingOrders = orders.filter(o => o.status === 'Processing').length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

    // Calculate total sales/revenue (sum of Completed orders)
    const totalSales = orders
      .filter(o => o.status === 'Completed')
      .reduce((sum, o) => sum + (o.price * o.quantity), 0);

    // Calculate total order value overall
    const totalValue = orders.reduce((sum, o) => sum + (o.price * o.quantity), 0);

    // Monthly sales/orders trend
    // Group orders by month (e.g. "Jan", "Feb", etc.)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesTrend = Array.from({ length: 6 }, (_, i) => {
      // Get last 6 months including current
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: months[d.getMonth()],
        year: d.getFullYear(),
        sales: 0,
        orders: 0,
        monthIndex: d.getMonth()
      };
    });

    orders.forEach(o => {
      const orderDate = new Date(o.date);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();

      const trendItem = salesTrend.find(t => t.monthIndex === orderMonth && t.year === orderYear);
      if (trendItem) {
        trendItem.orders += 1;
        if (o.status === 'Completed') {
          trendItem.sales += parseFloat((o.price * o.quantity).toFixed(2));
        }
      }
    });

    // Clean up float rounding in sales
    salesTrend.forEach(t => {
      t.sales = parseFloat(t.sales.toFixed(2));
      delete t.monthIndex; // Remove helper field
    });

    // Product distribution stats
    const productStats = {};
    orders.forEach(o => {
      if (productStats[o.productName]) {
        productStats[o.productName].quantity += o.quantity;
        productStats[o.productName].sales += o.price * o.quantity;
      } else {
        productStats[o.productName] = {
          name: o.productName,
          quantity: o.quantity,
          sales: o.price * o.quantity
        };
      }
    });

    const productBreakdown = Object.values(productStats).map(p => ({
      name: p.name,
      value: p.quantity,
      sales: parseFloat(p.sales.toFixed(2))
    })).sort((a, b) => b.sales - a.sales);

    // Recent activities (Mock activities for presentation)
    // We can generate some real-time feedback based on data
    const recentActivities = [
      {
        id: 'act_1',
        type: 'user',
        message: 'Super Admin updated security configurations',
        time: '2 hours ago'
      },
      {
        id: 'act_2',
        type: 'order',
        message: `New order created: ${orders[0] ? orders[0].orderId : 'ORD-1016'} for ${orders[0] ? orders[0].customerName : 'Client'}`,
        time: '3 hours ago'
      },
      {
        id: 'act_3',
        type: 'status',
        message: `Order ${orders[3] ? orders[3].orderId : 'ORD-1004'} was marked as Completed`,
        time: '1 day ago'
      },
      {
        id: 'act_4',
        type: 'user',
        message: 'New user Jane Manager was registered as Manager',
        time: '3 days ago'
      }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2))
      },
      salesTrend,
      productBreakdown,
      recentActivities
    });
  } catch (error) {
    console.error('Reports stats error:', error);
    res.status(500).json({ success: false, message: 'Server error generating reports' });
  }
});

module.exports = router;
