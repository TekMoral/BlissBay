import Coupon from "../models/discountSchema.js";
import Order from "../models/orderSchema.js"

export const createCoupon = async (req, res) => {
    try {
        const { 
          code, 
          discountType, 
          discountValue, 
          minOrderAmount, 
          maxDiscountAmount, 
          expiryDate, 
          usageLimit, 
          perUserLimit,
          applicableProducts, 
          applicableCategories 
        } = req.body;
    
        // Validate if a coupon with the same code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
          return res.status(400).json({ message: 'Coupon code already exists' });
        }
    
        // Validate discount value based on type
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
          return res.status(400).json({ message: 'Percentage discount must be between 1 and 100' });
        }
        
        // Validate expiry date
        const expiry = new Date(expiryDate);
        if (expiry <= new Date()) {
          return res.status(400).json({ message: 'Expiry date must be in the future' });
        }
    
        const newCoupon = new Coupon({
          code,
          discountType,
          discountValue,
          minOrderAmount: minOrderAmount || 0,
          maxDiscountAmount,
          expiryDate,
          usageLimit: usageLimit || 1,
          perUserLimit: perUserLimit || 1,
          applicableProducts: applicableProducts || [],
          applicableCategories: applicableCategories || [],
        });
    
        const savedCoupon = await newCoupon.save();
        res.status(201).json(savedCoupon);
      } catch (err) {
        console.error('Error creating coupon:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      };
};

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
          .populate('applicableProducts', 'name price')
          .populate('applicableCategories', 'name')
          .sort({ createdAt: -1 });
        
        res.json(coupons);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      };
};

export const getAllActiveCoupons = async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({ 
          status: 'active',
          expiryDate: { $gt: now }
        })
        .select('code discountType discountValue minOrderAmount maxDiscountAmount expiryDate')
        .sort({ createdAt: -1 });
        
        res.json(coupons);
      } catch (err) {
        console.error('Error fetching active coupons:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      };
};

export const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
          .populate('applicableProducts', 'name price')
          .populate('applicableCategories', 'name');
        
        if (!coupon) {
          return res.status(404).json({ message: 'Coupon not found' });
        }
        
        res.json(coupon);
      } catch (err) {
        console.error('Error fetching coupon:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      };
};

export const updateCoupon = async (req, res) => {
    try {
        const { 
          code,
          discountType, 
          discountValue, 
          minOrderAmount, 
          maxDiscountAmount, 
          expiryDate, 
          usageLimit, 
          perUserLimit,
          applicableProducts, 
          applicableCategories, 
          status 
        } = req.body;
    
        // Check if the coupon exists
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
          return res.status(404).json({ message: 'Coupon not found' });
        }
    
        // Check if code is being changed and if new code already exists
        if (code && code !== coupon.code) {
          const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
          if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
          }
        }
        
        // Validate discount value based on type
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
          return res.status(400).json({ message: 'Percentage discount must be between 1 and 100' });
        }
        
        // Validate expiry date if provided
        if (expiryDate) {
          const expiry = new Date(expiryDate);
          if (expiry <= new Date()) {
            return res.status(400).json({ message: 'Expiry date must be in the future' });
          }
        }
    
        // Update the coupon
        coupon.code = code || coupon.code;
        coupon.discountType = discountType || coupon.discountType;
        coupon.discountValue = discountValue || coupon.discountValue;
        coupon.minOrderAmount = minOrderAmount !== undefined ? minOrderAmount : coupon.minOrderAmount;
        coupon.maxDiscountAmount = maxDiscountAmount || coupon.maxDiscountAmount;
        coupon.expiryDate = expiryDate || coupon.expiryDate;
        coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
        coupon.perUserLimit = perUserLimit !== undefined ? perUserLimit : coupon.perUserLimit;
        coupon.applicableProducts = applicableProducts || coupon.applicableProducts;
        coupon.applicableCategories = applicableCategories || coupon.applicableCategories;
        coupon.status = status || coupon.status;
    
        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
      } catch (err) {
        console.error('Error updating coupon:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      };
};

export const applyCoupon = async (req, res) => {
    try {
        const { code, orderAmount, products, categories } = req.body;
    
        // Validate if the coupon exists
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
          return res.status(404).json({ message: 'Coupon not found' });
        }
    
        // Check if the coupon is active and not expired
        const now = new Date();
        if (coupon.status !== 'active' || coupon.expiryDate < now) {
          return res.status(400).json({ message: 'Coupon is not active or has expired' });
        }
    
        // Check if the order amount meets the minimum order requirement
        if (orderAmount < coupon.minOrderAmount) {
          return res.status(400).json({ 
            message: `Order amount should be at least ${coupon.minOrderAmount}` 
          });
        }
    
        // Check usage limits (total usage limit)
        if (coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({ message: 'Coupon usage limit reached' });
        }
    
        // Check if products are applicable (if specified)
        if (coupon.applicableProducts && coupon.applicableProducts.length > 0 && products) {
          const productIds = products.map(p => p.toString());
          const hasApplicableProduct = productIds.some(id => 
            coupon.applicableProducts.map(p => p.toString()).includes(id)
          );
          
          if (!hasApplicableProduct) {
            return res.status(400).json({ message: 'Coupon is not applicable to any products in your order' });
          }
        }
        
        // Check if categories are applicable (if specified)
        if (coupon.applicableCategories && coupon.applicableCategories.length > 0 && categories) {
          const categoryIds = categories.map(c => c.toString());
          const hasApplicableCategory = categoryIds.some(id => 
            coupon.applicableCategories.map(c => c.toString()).includes(id)
          );
          
          if (!hasApplicableCategory) {
            return res.status(400).json({ message: 'Coupon is not applicable to any product categories in your order' });
          }
        }
    
        // Calculate the discount value
        let discount = 0;
        if (coupon.discountType === 'percentage') {
          discount = (coupon.discountValue / 100) * orderAmount;
        } else if (coupon.discountType === 'fixed') {
          discount = coupon.discountValue;
        }
    
        // Ensure that the discount does not exceed the max discount allowed
        if (discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
    
        // Apply discount
        const discountedAmount = orderAmount - discount;
    
        // Update the coupon usage count
        coupon.usedCount += 1;
        await coupon.save();
    
        res.json({
          discount: parseFloat(discount.toFixed(2)),
          discountedAmount: parseFloat(discountedAmount.toFixed(2)),
          message: 'Coupon applied successfully',
        });
      } catch (err) {
        console.error('Error applying coupon:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      };
};

export const updateCouponStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['active', 'inactive'].includes(status)) {
          return res.status(400).json({ message: 'Status must be either active or inactive' });
        }
        
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
          return res.status(404).json({ message: 'Coupon not found' });
        }
        
        // Check if coupon is expired
        if (coupon.expiryDate < new Date()) {
          return res.status(400).json({ message: 'Cannot change status of expired coupon' });
        }
        
        coupon.status = status;
        await coupon.save();
        
        res.json({ message: `Coupon ${status === 'active' ? 'activated' : 'deactivated'} successfully`, coupon });
      } catch (err) {
        console.error('Error updating coupon status:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      };
};

export const deleteCoupon = async (req,res) => {
  try {
    const { id } = req.params;
    
    // Find the coupon first to check if it exists
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    // Check if the coupon has been used in any orders
    const ordersWithCoupon = await Order.countDocuments({ 'coupon.code': coupon.code });
    
    if (ordersWithCoupon > 0) {

      // Option 2: Soft delete
      coupon.isActive = false;
      coupon.updatedBy = req.user.id;
      await coupon.save();
      
      return res.status(200).json({ 
        message: 'Coupon has been deactivated instead of deleted because it has been used in orders',
        coupon
      });
    }
    
    // If no orders use this coupon, proceed with deletion
    await Coupon.findByIdAndDelete(id);
    
    // Log the deletion for audit purposes
    console.log(`Coupon ${coupon.code} deleted by admin ${req.user.id} at ${new Date()}`);
    
    return res.status(200).json({ message: 'Coupon deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}