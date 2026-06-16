const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { OrderDb } = require('../utils/dbMock');
const { protect, authorize } = require('../middleware/auth');
const { broadcastUpdate } = require('../utils/updates');

// Protect all routes
router.use(protect);

// @desc    Get all orders (accessible to all roles - search, filter, paginate, sort)
// @route   GET /api/orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { search, status, sortBy, order, page, limit } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    let ordersList = [];
    let total = 0;

    if (process.env.USE_MOCK_DB === 'true') {
      ordersList = await OrderDb.find();

      // Filter by search (orderId, customerName, productName)
      if (search) {
        const query = search.toLowerCase();
        ordersList = ordersList.filter(o => 
          o.orderId.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.productName.toLowerCase().includes(query)
        );
      }

      // Filter by status
      if (status) {
        ordersList = ordersList.filter(o => o.status === status);
      }

      total = ordersList.length;

      // Sort
      if (sortBy) {
        const sortOrder = order === 'desc' ? -1 : 1;
        ordersList.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
          if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
          return 0;
        });
      } else {
        // Default sort by date desc
        ordersList.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      // Paginate
      ordersList = ordersList.slice(skipNum, skipNum + limitNum);
    } else {
      // Mongoose DB
      let query = {};

      if (search) {
        query.$or = [
          { orderId: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } },
          { productName: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        query.status = status;
      }

      total = await Order.countDocuments(query);

      let sortQuery = {};
      if (sortBy) {
        sortQuery[sortBy] = order === 'desc' ? -1 : 1;
      } else {
        sortQuery.date = -1; // Default
      }

      ordersList = await Order.find(query)
        .sort(sortQuery)
        .skip(skipNum)
        .limit(limitNum);
    }

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      orders: ordersList
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving orders' });
  }
});

// @desc    Create a new order (Super Admin & Manager only)
// @route   POST /api/orders
// @access  Private (Super Admin, Manager)
router.post('/', authorize('Super Admin', 'Manager'), async (req, res) => {
  const { customerName, productName, quantity, price, status, date } = req.body;

  if (!customerName || !productName || !quantity || !price) {
    return res.status(400).json({ success: false, message: 'Please include customerName, productName, quantity and price' });
  }

  try {
    let newOrder;
    if (process.env.USE_MOCK_DB === 'true') {
      newOrder = await OrderDb.create({ customerName, productName, quantity, price, status, date });
    } else {
      // Auto-generate orderId
      const lastOrder = await Order.findOne().sort({ orderId: -1 });
      let lastNum = 1000;
      if (lastOrder && lastOrder.orderId) {
        lastNum = parseInt(lastOrder.orderId.split('-')[1]) || 1000;
      }
      const orderId = `ORD-${lastNum + 1}`;

      newOrder = await Order.create({
        orderId,
        customerName,
        productName,
        quantity,
        price,
        status,
        date: date || new Date()
      });
    }

    broadcastUpdate('order_event', {
      action: 'create',
      order: newOrder
    });

    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error creating order' });
  }
});

// @desc    Update order (Super Admin full update, Manager status-only update, Staff forbidden)
// @route   PUT /api/orders/:id
// @access  Private (Super Admin, Manager)
router.put('/:id', authorize('Super Admin', 'Manager'), async (req, res) => {
  const { customerName, productName, quantity, price, status, date } = req.body;

  try {
    let orderToUpdate;

    if (process.env.USE_MOCK_DB === 'true') {
      orderToUpdate = await OrderDb.findById(req.params.id);
    } else {
      orderToUpdate = await Order.findById(req.params.id);
    }

    if (!orderToUpdate) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let updateData = {};

    if (req.user.role === 'Manager') {
      // Manager can ONLY edit order status
      if (customerName || productName || quantity || price || date) {
        return res.status(403).json({ 
          success: false, 
          message: 'Managers are only authorized to update the order status.' 
        });
      }
      if (!status) {
        return res.status(400).json({ success: false, message: 'Please provide status to update' });
      }
      updateData = { status };
    } else {
      // Super Admin can edit everything
      if (customerName) updateData.customerName = customerName;
      if (productName) updateData.productName = productName;
      if (quantity) updateData.quantity = parseInt(quantity);
      if (price) updateData.price = parseFloat(price);
      if (status) updateData.status = status;
      if (date) updateData.date = new Date(date);
    }

    let updatedOrder;
    if (process.env.USE_MOCK_DB === 'true') {
      updatedOrder = await OrderDb.findByIdAndUpdate(req.params.id, updateData);
    } else {
      updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    }

    broadcastUpdate('order_event', {
      action: 'update',
      order: updatedOrder
    });

    res.status(200).json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Server error updating order' });
  }
});

// @desc    Delete order (Super Admin only)
// @route   DELETE /api/orders/:id
// @access  Private (Super Admin only)
router.delete('/:id', authorize('Super Admin'), async (req, res) => {
  try {
    let deletedOrder;

    if (process.env.USE_MOCK_DB === 'true') {
      deletedOrder = await OrderDb.findByIdAndDelete(req.params.id);
    } else {
      deletedOrder = await Order.findByIdAndDelete(req.params.id);
    }

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    broadcastUpdate('order_event', {
      action: 'delete',
      id: req.params.id
    });

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting order' });
  }
});

module.exports = router;
