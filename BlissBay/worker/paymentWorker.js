import { paymentQueue, JOB_TYPES } from '../utils/paymentQueue.js';
import paymentProcessor from '../utils/paymentProcessor.js';
import emailService from '../services/emailService.js';
import mongoose from 'mongoose';
import Order from '../models/orderSchema.js';


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Payment worker connected to MongoDB'))
.catch(err => {
  console.error('Payment worker MongoDB connection error:', err);
  process.exit(1);
});

// Process payment jobs
paymentQueue.process(JOB_TYPES.PROCESS_PAYMENT, async (job) => {
  console.log(`Processing payment job ${job.id} for order ${job.data.orderId}`);
  
  try {
    // Process the payment
    const result = await paymentProcessor.processPayment(job.data);
    
    // Send confirmation email
    await emailService.sendPaymentConfirmation({
      email: job.data.email,
      paymentDetails: {
        orderId: result.order._id,
        amount: result.payment.amount.toFixed(2),
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }
    });
    
    return { success: true, paymentId: result.payment._id };
  } catch (error) {
    console.error(`Payment processing failed for job ${job.id}:`, error);
    
    // If this is a final attempt, notify the customer
    if (job.attemptsMade >= job.opts.attempts - 1) {
      try {
        // Find the order to get customer email
        const order = await Order.findById(job.data.orderId);
        if (order) {
          // Update order status to payment_failed
          order.status = 'payment_failed';
          await order.save();
          
          // Send failure notification if we have the email
          if (job.data.email) {
            await emailService.sendPaymentFailureNotification({
              email: job.data.email,
              orderDetails: {
                orderId: job.data.orderId
              },
              errorMessage: error.message
            });
          }
        }
      } catch (notificationError) {
        console.error('Failed to send payment failure notification:', notificationError);
      }
    }
    
    throw error; // Rethrow to let Bull handle retries
  }
});

// Process payment confirmation jobs
paymentQueue.process(JOB_TYPES.SEND_PAYMENT_CONFIRMATION, async (job) => {
  console.log(`Sending payment confirmation for ${job.data.paymentDetails.orderId}`);
  
  try {
    await emailService.sendPaymentConfirmation(job.data);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send payment confirmation for job ${job.id}:`, error);
    throw error;
  }
});

// Process payment reconciliation jobs
paymentQueue.process(JOB_TYPES.PAYMENT_RECONCILIATION, async (job) => {
  console.log(`Reconciling payment ${job.data.paymentId} with order ${job.data.orderId}`);
  
  try {
    const result = await paymentProcessor.reconcilePayment(job.data);
    return { 
      success: true, 
      discrepancies: result.discrepancies 
    };
  } catch (error) {
    console.error(`Payment reconciliation failed for job ${job.id}:`, error);
    throw error;
  }
});

// Process refund jobs
paymentQueue.process(JOB_TYPES.PAYMENT_REFUND, async (job) => {
  console.log(`Processing refund for payment ${job.data.paymentId}`);
  
  try {
    const result = await paymentProcessor.processRefund(job.data);
    
    // Send refund confirmation email
    if (job.data.email) {
      await emailService.sendRefundConfirmation({
        email: job.data.email,
        refundDetails: {
          orderId: result.payment.orderId,
          amount: (job.data.amount || result.payment.amount).toFixed(2),
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          reason: job.data.reason
        }
      });
    }
    
    return { success: true, refundId: result.refund.id };
  } catch (error) {
    console.error(`Refund processing failed for job ${job.id}:`, error);
    throw error;
  }
});

// Handle completed jobs
paymentQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

// Handle failed jobs
paymentQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing queue connections');
  await paymentQueue.close();
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing queue connections');
  await paymentQueue.close();
  await mongoose.disconnect();
  process.exit(0);
});

console.log('Payment worker started and listening for jobs');