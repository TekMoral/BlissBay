import mongoose from "mongoose";
import Cart from "../models/cartSchema.js";
import Product from "../models/productSchema.js";
import Order from "../models/orderSchema.js";
import { cartItemSchema } from '../validators/cartValidator.js'; 


const MAX_CART_ITEMS = 50; // Max items in a cart
const MAX_PRODUCT_QUANTITY = 100; // Max quantity per product


const roundToTwoDecimalPlaces = (price) => Math.round(price * 100) / 100;


export const createCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;

    //Validate input using Joi
    const { error, value } = cartItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { productId, quantity } = value;

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'Insufficient stock',
        available: product.stock,
      });
    }

    const price = roundToTwoDecimalPlaces(product.price || product.currentPrice);

    let cart = await Cart.findOne({ userId }).session(session);

    if (!cart) {
      cart = new Cart({ userId, items: [], totalAmount: 0 });
    }

    if (cart.items.length >= MAX_CART_ITEMS) {
      await session.abortTransaction();
      return res.status(400).json({ error: `Cart size exceeds the maximum of ${MAX_CART_ITEMS} items` });
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      if (cart.items[existingItemIndex].quantity + quantity > MAX_PRODUCT_QUANTITY) {
        await session.abortTransaction();
        return res.status(400).json({ error: `Cannot exceed ${MAX_PRODUCT_QUANTITY} units per product` });
      }
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = price;
    } else {
      cart.items.push({ productId, quantity, price });
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    product.stock -= quantity;
    await product.save({ session });
    await cart.save({ session });

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        _id: cart._id
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error adding item to cart:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    session.endSession();
  }
};

export const getCart = async (req, res) => {
      try {
          const userId = req.user.userId;
          
          const cart = await Cart.findOne({ userId });
          
          if (!cart) {
            return res.status(200).json({
              success: true,
              cart: {
                items: [],
                totalAmount: 0
              }
            });
          }
          
         // Extract product IDs from the cart items
         const productIds = cart.items.map(item => item.productId);
    
         // Fetch all products in one query to minimize database calls
         const products = await Product.find({ _id: { $in: productIds } });
     
         // Map products by their ID for easy lookup
         const productMap = products.reduce((map, product) => {
           map[product._id] = product;
           return map;
         }, {});
     
         // Attach product details to each cart item
         cart.items = cart.items.map(item => ({
           ...item,
           productDetails: productMap[item.productId.toString()] || {}
         }));
    
          return res.status(200).json({
            success: true,
            cart: {
              _id: cart._id,
              items: cart.items,
              totalAmount: cart.totalAmount,
              createdAt: cart.createdAt,
              updatedAt: cart.updatedAt
            }
          });
        } catch (error) {
          console.error('Error fetching cart:', error);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch cart',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
          });
        };
};

export const updateCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;

    // Validate input using Joi schema
    const { error, value } = cartItemSchema.validate(req.body);
    if (error) {
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const { productId, quantity } = value;

    // Find user's cart
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    const currentQuantity = cart.items[itemIndex].quantity;
    const quantityDifference = quantity - currentQuantity;

    // Increase case
    if (quantityDifference > 0) {
      const product = await Product.findById(productId).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product.stock < quantityDifference) {
        await session.abortTransaction();
        return res.status(400).json({
          error: 'Insufficient stock for quantity increase',
          available: product.stock
        });
      }

      if (quantity > MAX_PRODUCT_QUANTITY) {
        await session.abortTransaction();
        return res.status(400).json({ error: `Cannot exceed ${MAX_PRODUCT_QUANTITY} units per product` });
      }

      product.stock -= quantityDifference;
      await product.save({ session });
    }

    // Decrease case
    else if (quantityDifference < 0) {
      const product = await Product.findById(productId).session(session);
      if (product) {
        product.stock += Math.abs(quantityDifference);
        await product.save({ session });
      }
    }

    // Remove if quantity is 0
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    await cart.save({ session });
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        _id: cart._id
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating cart:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to update cart',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    session.endSession();
  }
};

export const deleteItemFromCart = async (req, res) => {
     const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
          const userId = req.user.userId;
          const { productId } = req.params;
          
          // Input validation
          if (!mongoose.Types.ObjectId.isValid(productId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Invalid product ID format' });
          }
          
          // Find user's cart
          const cart = await Cart.findOne({ userId }).session(session);
          if (!cart) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Cart not found' });
          }
          
          // Find the item in the cart
          const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
          if (itemIndex === -1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Item not found in cart' });
          }
          
          // Get the quantity to return to stock
          const quantityToReturn = cart.items[itemIndex].quantity;
          
          // Return items to stock
          const product = await Product.findById(productId).session(session);
          if (product) {
            product.stock += quantityToReturn;
            await product.save({ session });
          }
          
          // Remove the item from cart
          cart.items.splice(itemIndex, 1);
          
          // Recalculate total amount
          cart.totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
          
          // Save the updated cart
          await cart.save({ session });
          
          // Commit the transaction
          await session.commitTransaction();
          session.endSession();
          
          return res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            cart: {
              items: cart.items,
              totalAmount: cart.totalAmount,
              _id: cart._id
            }
          });
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          
          console.error('Error removing item from cart:', error);
          return res.status(500).json({
            success: false,
            error: 'Failed to remove item from cart',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
          });
        } finally {
          session.endSession();
        };
};

export const deleteCart = async (req, res) => {
    const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
          const userId = req.user.userId;
          
          // Find user's cart
          const cart = await Cart.findOne({ userId }).session(session);
          if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({
              success: true,
              message: 'Cart is already empty'
            });
          }
          
          // Return all items to stock
          for (const item of cart.items) {
            const product = await Product.findById(item.productId).session(session);
            if (product) {
              product.stock += item.quantity;
              await product.save({ session });
            }
          }
          
          // Clear cart items and reset total
          cart.items = [];
          cart.totalAmount = 0;
          
          // Save the updated cart
          await cart.save({ session });
          
          // Commit the transaction
          await session.commitTransaction();
          session.endSession();
          
          return res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            cart: {
              items: [],
              totalAmount: 0,
              _id: cart._id
            }
          });
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          
          console.error('Error clearing cart:', error);
          return res.status(500).json({
            success: false,
            error: 'Failed to clear cart',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
          });
        } finally {
          session.endSession();
        };
};

export const checkoutCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;
    const { shippingAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      await session.abortTransaction();
      return res.status(400).json({
        error: !shippingAddress
          ? 'Shipping address is required'
          : 'Payment method is required',
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // Get product IDs from cart items
    const productIds = cart.items.map((item) => item.productId);

    // Fetch all products in a single query
    const products = await Product.find({ _id: { $in: productIds } }).session(session);

    // Create product lookup map
    const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    const validItems = [];
    const invalidItems = [];

    // Loop through cart items to validate them
    for (const item of cart.items) {
      const product = productMap[item.productId.toString()];

      if (!product) {
        invalidItems.push({
          productId: item.productId,
          reason: 'Product no longer exists',
        });
        continue;
      }

      if (product.stock < item.quantity) {
        invalidItems.push({
          productId: product._id,
          name: product.name,
          requestedQuantity: item.quantity,
          availableStock: product.stock,
          reason: 'Insufficient stock',
        });
        continue;
      }

      validItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Abort if any items are invalid
    if (invalidItems.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'Some items in your cart are no longer available',
        invalidItems,
      });
    }

    // Calculate total amount
    const totalAmount = validItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Create and save the order
    const newOrder = new Order({
      userId,
      items: validItems,
      total: totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'processing',
    });

    await newOrder.save({ session });

    // Update stock quantities
    for (const item of validItems) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // Clear the cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error during checkout:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to complete checkout',
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  } finally {
    session.endSession();
  }
};
