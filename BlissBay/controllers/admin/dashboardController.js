import Product from '../../models/productSchema.js';
import User from '../../models/userSchema.js';
import Order from '../../models/orderSchema.js';

/**
 * Get main dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate revenue with error handling for empty collections
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } }, // Only count completed orders
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Get monthly revenue for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
 // monthlyRevenue 

 const monthlyRevenue = await Order.aggregate([
  { 
    $match: { 
      status: 'completed',
      createdAt: { $gte: sixMonthsAgo }
    }
  },
  {
    $group: {
      _id: { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      revenue: { $sum: '$totalPrice' }
    }
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } }
]);

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formattedMonthlyRevenue = monthlyRevenue.map(item => ({
  month: monthNames[item._id.month - 1],
  year: item._id.year,
  revenue: item.revenue
}));

    
    // Recent user registrations (past 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyRevenue: formattedMonthlyRevenue,
      newUsers,
      // Include a timestamp to help with caching decisions on the client
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get recent orders with pagination
 */
export const getRecentOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .lean();
      
    const totalOrders = await Order.countDocuments();
    
    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalItems: totalOrders
      }
    });
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({ message: 'Error fetching recent orders' });
  }
};

/**
 * Get popular products based on order frequency
 */
export const getPopularProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$products' },
      { 
        $group: { 
          _id: '$products.productId', 
          count: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 1,
          name: '$productDetails.name',
          count: 1,
          revenue: 1,
          price: '$productDetails.price',
          image: '$productDetails.image'
        }
      }
    ]);
    
    res.json(topProducts);
  } catch (error) {
    console.error('Popular products error:', error);
    res.status(500).json({ message: 'Error fetching popular products' });
  }
};