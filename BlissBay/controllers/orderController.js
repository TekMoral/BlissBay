import mongoose from "mongoose";
import Cart from "../models/cartSchema.js";
import Order from "../models/orderSchema.js";
import { createOrderSchema } from "../validators/orderValidator.js"; // Import Joi schema

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.UserId;

    // Basic presence check
    if (!shippingAddress || !paymentMethod) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Shipping address and payment method are required" });
    }

    // Validate with Joi
    const { error } = createOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
      await session.abortTransaction();
      return res.status(400).json({ errors: error.details.map(err => err.message) });
    }

    // Fetch user's cart
    const cart = await Cart.findOne({ userId }).session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Your cart is empty" });
    }

    // Map cart items to order items
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newOrder = new Order({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: "Pending",
    });

    await newOrder.save({ session });

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

 

/**
 * Get user orders with pagination, sorting and filtering options
 * @route GET /api/orders
 * @access Private
 */
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting parameters
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };
    
    // Optional date range filter
    const dateFilter = {};
    if (req.query.startDate) {
      dateFilter.createdAt = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      dateFilter.createdAt = { 
        ...dateFilter.createdAt, 
        $lte: new Date(req.query.endDate) 
      };
    }
    
    // Optional status filter
    if (req.query.status) {
      dateFilter.status = req.query.status;
    }
    
    // Build final query
    const query = {
      userId,
      ...dateFilter
    };
    
    // Execute query with pagination and sorting
    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'items.productId',
        select: 'name price images'
      })
      .populate({
        path: 'shippingAddress',
        select: '-__v'
      })
      .lean();
    
    // Get total count for pagination info
    const totalOrders = await Order.countDocuments(query);
    
    // Check if no orders found
    if (!orders || orders.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "No orders found",
        data: {
          orders: [],
          pagination: {
            totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
            perPage: limit
          }
        }
      });
    }
    
    // Return success response with orders and pagination info
    return res.status(200).json({ 
      success: true, 
      data: {
        orders,
        pagination: {
          totalOrders,
          totalPages: Math.ceil(totalOrders / limit),
          currentPage: page,
          perPage: limit
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching orders:", error);
    
    // Return appropriate error message
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid query parameter format" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: "An error occurred while fetching orders",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a specific order by ID
 * @route GET /api/orders/:orderId
 * @access Private
 */
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.orderId;
    
    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid order ID format" 
      });
    }
    
    // Find the specific order
    const order = await Order.findOne({ 
      _id: orderId,
      userId // Ensure user can only access their own orders
    })
    .populate({
      path: 'items.productId',
      select: 'name price images description'
    })
    .populate('shippingAddress')
    .lean();
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: "Order not found" 
      });
    }
    
    // Return the order
    return res.status(200).json({ 
      success: true, 
      data: { order }
    });
    
  } catch (error) {
    console.error("Error fetching order:", error);
    
    // Return appropriate error message
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid order ID format" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: "An error occurred while fetching the order",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


