import mongoose from "mongoose";
import Order from "../../models/orderSchema.js";
import ActivityLog from "../../models/activityLogSchema.js";
import Notification from "../../models/notificationSchema.js"



/**
 * Get all orders (Admin)
 * @route GET /api/admin/orders
 * @access Admin
 */

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword || ""; // Optional search by user email or order ID

    const filter = {};

    if (keyword) {
      const isObjectId = mongoose.Types.ObjectId.isValid(keyword);
      filter.$or = [
        isObjectId ? { _id: keyword } : {}, // Match by order ID
        { transactionId: { $regex: keyword, $options: "i" } }
      ];
    }

    const totalOrders = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: totalOrders,
          page,
          limit,
          totalPages: Math.ceil(totalOrders / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};




/**
 * Get single order details (Admin)
 * @route GET /api/admin/orders/:orderId
 * @access Admin
 */
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, error: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId)
      .populate('user', 'name email') // Customer details
      .populate('items.product', 'name price image') // Product info in items
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    return res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};


/**
 * Update order status (Admin only)
 * @route PATCH /api/admin/orders/:orderId
 * @access Admin
 */
export const updateOrderStatus = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, paymentStatus, transactionId } = req.body;
      const adminId = req.user.id; // Capturing who made the change
      
      // 1. Validate orderId format
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid order ID format' 
        });
      }
      
      // 2. Validate input data
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
      
      // 3. Check if any update fields were provided
      if (!status && !paymentStatus && !transactionId) {
        return res.status(400).json({
          success: false,
          error: 'No update fields provided'
        });
      }
      
      // 4. Find the order first to capture original values for logging
      const originalOrder = await Order.findById(orderId);
      
      if (!originalOrder) {
        return res.status(404).json({ 
          success: false, 
          error: 'Order not found' 
        });
      }
      
      const originalStatus = originalOrder.status;
      const originalPaymentStatus = originalOrder.paymentStatus;
      
      // 5. Update the order
      originalOrder.set({
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(transactionId && { transactionId }),
        updatedAt: new Date(),
        updatedBy: adminId
      });
      
      const updatedOrder = await originalOrder.save();
      
      // 6. Log the status change
      await ActivityLog.create({
        entityType: 'Order',
        entityId: orderId,
        action: 'STATUS_UPDATE',
        performedBy: adminId,
        details: {
          previousStatus: originalStatus || 'unknown',
          newStatus: status || originalStatus,
          previousPaymentStatus: originalPaymentStatus || 'unknown',
          newPaymentStatus: paymentStatus || originalPaymentStatus
        },
        timestamp: new Date()
      });
      
      // 7. Send notifications if appropriate status changes occurred
      if (status === 'shipped') {
        // Notify customer about shipment
        await Notification.sendOrderStatusUpdate(updatedOrder);
      }
      
      // 8. Return success response
      return res.status(200).json({ 
        success: true, 
        message: 'Order updated successfully', 
        data: { order: updatedOrder } 
      });
      
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // 9. Detailed error handling
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: Object.values(error.errors).map(err => err.message)
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'An error occurred while updating the order',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };