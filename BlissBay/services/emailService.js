
import sgMail from '@sendgrid/mail';
import User from '../models/userSchema.js';
import logger from '../config/logger.js';
import { createQueue } from '../config/bullConfig.js';


// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create notification queue for background processing
const notificationQueue = createQueue('notifications', {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 10000,
  },
});

/**
 * Send email notification using SendGrid
 * @param {Object} emailData - Email data including to, subject, and html content
 * @returns {Promise} - Result of the email sending operation
 */
const sendEmail = async (emailData) => {
  try {
    const { to, subject, html, text } = emailData;
    
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if text not provided
    };
    
    const [response] = await sgMail.send(msg);
    logger.info(`Email sent with status code: ${response.statusCode}`, { to, subject });
    
    return {
      messageId: response.headers['x-message-id'],
      statusCode: response.statusCode
    };
  } catch (error) {
    logger.error('Error sending email with SendGrid:', error);
    throw error;
  }
};

/**
 * Get user contact details by ID
 * @param {string} userId - User ID
 * @returns {Object} - User contact details
 */
const getUserContactDetails = async (userId) => {
  try {
    const user = await User.findById(userId).select('email firstName lastName notificationPreferences');
    
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    
    return {
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      preferences: user.notificationPreferences || { email: true, push: false, sms: false },
    };
  } catch (error) {
    logger.error('Error fetching user contact details:', error);
    throw error;
  }
};

/**
 * Queue a notification for background processing
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 * @param {string} userId - User ID to notify
 * @returns {Promise} - Job details
 */
export const queueNotification = async (type, data, userId) => {
  try {
    const job = await notificationQueue.add(
      'process-notification',
      {
        type,
        data,
        userId,
        timestamp: new Date(),
      }
    );
    
    logger.info(`Notification queued: ${type}`, { userId, jobId: job.id });
    return job;
  } catch (error) {
    logger.error('Error queueing notification:', error);
    throw error;
  }
};

/**
 * Send order status update notification
 * @param {Object} order - Order object with complete details
 * @returns {Promise} - Result of the notification operation
 */
export const sendOrderStatusUpdate = async (order) => {
  try {
    if (!order || !order.userId) {
      throw new Error('Invalid order data for notification');
    }
    
    const user = await getUserContactDetails(order.userId);
    
    // Only send notification if user has email notifications enabled
    if (!user.preferences.email) {
      logger.info(`Skipping email notification - user opted out: ${order.userId}`);
      return { skipped: true, reason: 'user-preference' };
    }
    
    // Format order items for email
    const formattedItems = order.items.map(item => ({
      name: item.productName || 'Product',
      quantity: item.quantity,
      price: (item.price || 0).toFixed(2),
    }));
    
    // Create email content based on order status
    let subject, content;
    
    switch (order.status) {
      case 'processing':
        subject = 'Your Order is Being Processed';
        content = `<h2>Hello ${user.firstName},</h2>
                   <p>Good news! We're now processing your order #${order.orderNumber}.</p>
                   <p>We'll send another update when your items ship.</p>`;
        break;
        
      case 'shipped':
        subject = 'Your Order Has been Shipped';
        content = `<h2>Hello ${user.firstName},</h2>
                   <p>Great news! Your order #${order.orderNumber} has been shipped.</p>
                   <p>${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : 'Tracking information will be provided soon.'}</p>
                   <p>Estimated delivery: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : '3-5 business days'}</p>`;
        break;
        
      case 'delivered':
        subject = 'Your Order Has Been Delivered';
        content = `<h2>Hello ${user.firstName},</h2>
                   <p>Your order #${order.orderNumber} has been delivered!</p>
                   <p>We hope you're enjoying your purchase. If you have a moment, we'd love to hear your feedback.</p>`;
        break;
        
      case 'cancelled':
        subject = 'Your Order Has Been Cancelled';
        content = `<h2>Hello ${user.firstName},</h2>
                   <p>Your order #${order.orderNumber} has been cancelled.</p>
                   <p>If you didn't request this cancellation, please contact our customer support.</p>`;
        break;
        
      default:
        subject = `Order Update: ${order.status}`;
        content = `<h2>Hello ${user.firstName},</h2>
                   <p>The status of your order #${order.orderNumber} has been updated to: ${order.status}</p>`;
    }
    
    // Add order summary to all notifications
    content += `<h3>Order Summary</h3>
                <p>Order Number: ${order.orderNumber}</p>
                <p>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
                <h4>Items:</h4>
                <ul>
                ${formattedItems.map(item => `<li>${item.name} (Qty: ${item.quantity}) - $${item.price}</li>`).join('')}
                </ul>
                <p>If you have any questions, please contact our customer support.</p>
                <p>Thank you for shopping with BlissBay!</p>`;
    
    // Send the email using SendGrid
    const emailData = {
      to: user.email,
      subject,
      html: content,
    };
    
    const result = await sendEmail(emailData);
    
    // Save notification record in the database
    await queueNotification('ORDER_STATUS', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      messageId: result.messageId,
      sendGridStatusCode: result.statusCode,
    }, order.userId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Error sending order status notification:', error);
    
    // Still try to queue a retry in case of temporary failure or SendGrid service issues
    try {
      await notificationQueue.add(
        'retry-notification',
        {
          type: 'ORDER_STATUS',
          orderId: order?._id,
          status: order?.status,
          userId: order?.userId,
          error: error.message,
          errorCode: error.code, // SendGrid specific error code if available
          timestamp: new Date(),
        },
        { delay: 15 * 60 * 1000 } // Retry in 15 minutes
      );
    } catch (queueError) {
      logger.error('Failed to queue notification retry:', queueError);
    }
    
    throw error;
  }
};

/**
 * Send welcome email to new user
 * @param {Object} user - User object with email and name
 * @returns {Promise} - Result of the email sending operation
 */
export const sendWelcomeEmail = async (user) => {
  try {
    if (!user || !user.email) {
      throw new Error('Invalid user data for welcome email');
    }
    
    const emailData = {
      to: user.email,
      subject: 'Welcome to Our Store!',
      html: `<h2>Welcome ${user.firstName || 'to our store'}!</h2>
             <p>Thank you for creating an account with us. We're excited to have you as a customer!</p>
             <p>You can now:</p>
             <ul>
               <li>Browse our products</li>
               <li>Save items to your wishlist</li>
               <li>Track your orders</li>
               <li>Update your profile and preferences</li>
             </ul>
             <p>If you have any questions, feel free to contact our support team.</p>
             <p>Happy shopping!</p>`,
    };
    
    const result = await sendEmail(emailData);
    
    await queueNotification('WELCOME', {
      messageId: result.messageId,
    }, user._id);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User email address
 * @param {string} resetToken - Password reset token
 * @param {string} resetUrl - Complete password reset URL
 * @returns {Promise} - Result of the email sending operation
 */
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    if (!email || !resetToken || !resetUrl) {
      throw new Error('Missing required data for password reset email');
    }
    
    const emailData = {
      to: email,
      subject: 'Password Reset Request',
      html: `<h2>Password Reset Request</h2>
             <p>You requested a password reset for your account. Click the link below to reset your password:</p>
             <p><a href="${resetUrl}">Reset Your Password</a></p>
             <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
             <p>This link will expire in 1 hour for security reasons.</p>`,
    };
    
    const result = await sendEmail(emailData);
    logger.info(`Password reset email sent to: ${email}`);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send order confirmation notification
 * @param {Object} order - Complete order details
 * @returns {Promise} - Result of the notification operation
 */
export const sendOrderConfirmation = async (order) => {
  try {
    if (!order || !order.userId) {
      throw new Error('Invalid order data for confirmation');
    }
    
    const user = await getUserContactDetails(order.userId);
    
    // Format order items for email
    const formattedItems = order.items.map(item => ({
      name: item.productName || 'Product',
      quantity: item.quantity,
      price: (item.price || 0).toFixed(2),
    }));
    
    const emailData = {
      to: user.email,
      subject: `Order Confirmation #${order.orderNumber}`,
      html: `<h2>Thank You for Your Order, ${user.firstName}!</h2>
             <p>We've received your order and it's being processed.</p>
             <h3>Order Details</h3>
             <p>Order Number: ${order.orderNumber}</p>
             <p>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
             <p>Payment Method: ${order.paymentMethod}</p>
             <p>Payment Status: ${order.paymentStatus}</p>
             
             <h3>Items</h3>
             <ul>
             ${formattedItems.map(item => `<li>${item.name} (Qty: ${item.quantity}) - $${item.price}</li>`).join('')}
             </ul>
             
             <h3>Order Summary</h3>
             <p>Subtotal: $${(order.subtotal || order.totalAmount).toFixed(2)}</p>
             ${order.tax ? `<p>Tax: $${order.tax.toFixed(2)}</p>` : ''}
             ${order.shippingCost ? `<p>Shipping: $${order.shippingCost.toFixed(2)}</p>` : ''}
             ${order.discount ? `<p>Discount: -$${order.discount.toFixed(2)}</p>` : ''}
             <p><strong>Total: $${order.totalAmount.toFixed(2)}</strong></p>
             
             <h3>Shipping Information</h3>
             <p>${order.shippingAddress.fullName || user.firstName + ' ' + user.lastName}</p>
             <p>${order.shippingAddress.street}</p>
             <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
             <p>${order.shippingAddress.country}</p>
             
             <p>We'll send you another email when your order ships.</p>
             <p>Thank you for shopping with us!</p>`,
    };
    
    const result = await sendEmail(emailData);
    
    await queueNotification('ORDER_CONFIRMATION', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      messageId: result.messageId,
    }, order.userId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Error sending order confirmation:', error);
    throw error;
  }
};


/**
 * Send payment confirmation email
 * @param {Object} data - Payment confirmation data
 * @returns {Promise} - Result of the email sending operation
 */
export const sendPaymentConfirmation = async (data) => {
  try {
    const { email, paymentDetails } = data;
    
    const emailData = {
      to: email,
      subject: `Payment Confirmation for Order #${paymentDetails.orderId}`,
      html: `<h2>Payment Confirmation</h2>
             <p>Thank you for your payment!</p>
             <p>Order ID: ${paymentDetails.orderId}</p>
             <p>Amount: $${paymentDetails.amount}</p>
             <p>Date: ${paymentDetails.date}</p>
             <p>Thank you for shopping with us!</p>`,
    };
    
    const result = await sendEmail(emailData);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Error sending payment confirmation email:', error);
    throw error;
  }
};

/**
 * Send payment failure notification
 * @param {Object} data - Payment failure data
 * @returns {Promise} - Result of the email sending operation
 */
export const sendPaymentFailureNotification = async (data) => {
  try {
    const { email, orderDetails, errorMessage } = data;
    
    const emailData = {
      to: email,
      subject: `Payment Failed for Order #${orderDetails.orderId}`,
      html: `<h2>Payment Failed</h2>
             <p>We were unable to process your payment for order #${orderDetails.orderId}.</p>
             <p>Reason: ${errorMessage || 'Payment processing error'}</p>
             <p>Please update your payment information or contact our customer support for assistance.</p>`,
    };
    
    const result = await sendEmail(emailData);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Error sending payment failure notification:', error);
    throw error;
  }
};

/**
 * Send refund confirmation email
 * @param {Object} data - Refund confirmation data
 * @returns {Promise} - Result of the email sending operation
 */
export const sendRefundConfirmation = async (data) => {
  try {
    const { email, refundDetails } = data;
    
    const emailData = {
      to: email,
      subject: `Refund Confirmation for Order #${refundDetails.orderId}`,
      html: `<h2>Refund Confirmation</h2>
             <p>Your refund has been processed.</p>
             <p>Order ID: ${refundDetails.orderId}</p>
             <p>Amount: $${refundDetails.amount}</p>
             <p>Date: ${refundDetails.date}</p>
             <p>Reason: ${refundDetails.reason || 'Customer request'}</p>
             <p>If you have any questions, please contact our customer support.</p>`,
    };
    
    const result = await sendEmail(emailData);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Error sending refund confirmation email:', error);
    throw error;
  }
};


export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderStatusUpdate,
  sendOrderConfirmation,
  queueNotification,
  sendPaymentConfirmation,
  sendPaymentFailureNotification,
  sendRefundConfirmation
};