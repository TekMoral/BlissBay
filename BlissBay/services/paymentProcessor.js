import mongoose from 'mongoose';
import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Order from '../models/orderSchema.js';
// Import but don't use these services directly
// import emailService from './emailService.js';
// import { addPaymentConfirmationJob } from './paymentQueue.js';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
/**
 * Process a payment through Stripe
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Processing result
 */
const processPayment = async (paymentData) => {
  const { orderId, userId, paymentMethodId } = paymentData;

  // Validate Order ID
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Invalid order ID');
  }

  // Find the order
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if order is already paid
  if (order.status === "paid" || order.status === "processing" || order.status === "shipped" || order.status === "delivered") {
    throw new Error(`Order cannot be paid again (current status: ${order.status})`);
  }

  // Validate payment Method
  if (!paymentMethodId) {
    throw new Error('Payment method is required');
  }

  // Validate order amount
  if (!order.totalAmount || order.totalAmount <= 0) {
    throw new Error('Invalid order amount');
  }

  // Process payment with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100), // Stripe requires amount in cents
    currency: "usd",
    payment_method: paymentMethodId,
    confirm: true,
    description: `Order #${order._id}`,
    metadata: {
      orderId: order._id.toString(),
      userId: userId
    }
  });

  // Validate payment amount matches order amount
  const paymentAmountInDollars = paymentIntent.amount / 100;
  if (Math.abs(paymentAmountInDollars - order.totalAmount) > 0.01) {
    console.warn(`Payment amount discrepancy: Order amount ${order.totalAmount}, Paid amount ${paymentAmountInDollars}`);
  }

  // Create payment record
  const payment = new Payment({
    userId,
    orderId: order._id,
    amount: order.totalAmount,
    paymentMethod: "credit_card",
    transactionId: paymentIntent.id,
    status: paymentIntent.status === "succeeded" ? "completed" : "pending",
    metadata: {
      stripePaymentIntentId: paymentIntent.id,
      paymentMethodId: paymentMethodId,
      amountPaid: paymentAmountInDollars
    }
  });
  await payment.save();

  // Update order status
  order.status = "paid";
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentId = payment._id;
  await order.save();

  return {
    success: true,
    payment,
    order,
    paymentIntent
  };
};

/**
 * Process a refund
 * @param {Object} refundData - Refund data
 * @returns {Promise<Object>} Refund result
 */
const processRefund = async (refundData) => {
  const { paymentId, amount, reason } = refundData;

  // Find the payment
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  // Check if payment can be refunded
  if (payment.status !== 'completed') {
    throw new Error(`Payment cannot be refunded (current status: ${payment.status})`);
  }

  // Get the Stripe payment intent ID
  const paymentIntentId = payment.metadata?.stripePaymentIntentId;
  if (!paymentIntentId) {
    throw new Error('Payment intent ID not found');
  }

  // Process refund with Stripe
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined, // Optional partial refund
    reason: reason || 'requested_by_customer'
  });

  // Update payment record
  payment.status = amount && amount < payment.amount ? 'partially_refunded' : 'refunded';
  payment.metadata = {
    ...payment.metadata,
    refundId: refund.id,
    refundAmount: amount || payment.amount,
    refundReason: reason,
    refundDate: new Date()
  };
  await payment.save();

  // Update order if fully refunded
  if (!amount || amount >= payment.amount) {
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.status = 'refunded';
      await order.save();
    }
  }

  return {
    success: true,
    refund,
    payment
  };
};

/**
 * Reconcile payment with order
 * @param {Object} reconciliationData - Reconciliation data
 * @returns {Promise<Object>} Reconciliation result
 */
const reconcilePayment = async (reconciliationData) => {
  const { paymentId, orderId } = reconciliationData;

  const payment = await Payment.findById(paymentId);
  const order = await Order.findById(orderId);

  if (!payment || !order) {
    throw new Error('Payment or order not found');
  }

  // Check for discrepancies
  const discrepancies = [];
  
  if (payment.amount !== order.totalAmount) {
    discrepancies.push(`Amount mismatch: Payment ${payment.amount}, Order ${order.totalAmount}`);
  }
  
  if (payment.status === 'completed' && order.status !== 'paid') {
    discrepancies.push(`Status mismatch: Payment completed but order status is ${order.status}`);
    
    // Fix order status
    order.status = 'paid';
    order.isPaid = true;
    if (!order.paidAt) order.paidAt = Date.now();
    await order.save();
  }

  return {
    success: true,
    discrepancies,
    payment,
    order
  };
};

module.exports = {
  processPayment,
  processRefund,
  reconcilePayment
};