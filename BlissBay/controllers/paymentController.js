import mongoose from 'mongoose';
import Payment from '../models/paymentSchema.js';
import Order  from '../models/orderSchema.js';
import { sendPaymentConfirmation, sendPaymentFailureNotification } from '../services/emailService.js';
import addPaymentProcessingJob from '../services/paymentQueue.js';
import Stripe from 'stripe';
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

const createResponse = (success, message, data = null) => ({
  success,
  message,
  ...(data && { data }),
});

export async function processPayment(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, paymentMethodId } = req.body;

    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({ message: 'Payment processing not configured' });
    }

    // Find the order to process
    const order = await Order.findOne({ _id: orderId }).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order has already been processed
    if (order.status === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Stripe payment processing logic
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalAmount * 100, // Stripe expects the amount in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
    });

    if (paymentIntent.status === 'succeeded') {
      // Update order status to "paid" inside the transaction
      order.status = 'paid';
      await order.save({ session });

      // Create payment record
      const payment = new Payment({
        orderId: order._id,
        amount: order.totalAmount,
        status: 'successful',
        paymentMethod: 'stripe',
        transactionId: paymentIntent.id,
      });
      await payment.save({ session });

      // Add payment processing job to the queue
      await addPaymentProcessingJob(payment);

      // Send payment confirmation email
      await sendPaymentConfirmation({
        email: order.customerEmail,
        paymentDetails: {
          orderId: order._id,
          amount: order.totalAmount,
          date: new Date().toLocaleDateString(),
        },
      });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({ message: 'Payment processed successfully', jobId: payment._id });
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    // If an error occurs, abort the transaction and send a failure notification
    await session.abortTransaction();
    session.endSession();

    console.error('Payment processing failed:', error);

    try {
      // Send payment failure notification email
      const order = await Order.findOne({ _id: req.body.orderId });
      if (order && order.customerEmail) {
        await sendPaymentFailureNotification({
          email: order.customerEmail,
          orderDetails: { orderId: req.body.orderId },
          errorMessage: error.message,
        });
      }
    } catch (emailError) {
      console.error('Failed to send payment failure email:', emailError);
    }

    return res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
}

export async function getPaymentStatus(req, res) {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json(createResponse(false, "Invalid user authentication"));
    }

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .populate("orderId", "orderNumber items status");

    if (!payments || payments.length === 0) {
      return res.status(200).json(createResponse(true, "No payment history found", { payments: [] }));
    }

    const formattedPayments = payments.map(payment => {
      const paymentObj = payment.toObject();
      paymentObj.amount = parseFloat(payment.amount.toFixed(2));
      return paymentObj;
    });

    return res.status(200).json(createResponse(true, "Payment history retrieved", { payments: formattedPayments }));
  } catch (error) {
    console.error("Error retrieving payment history:", error);
    return res.status(500).json(createResponse(false, "Internal server error"));
  }
}
