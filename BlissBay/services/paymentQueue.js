import { createQueue } from '../config/bullConfig.js';

// Create payment processing queue
const paymentQueue = createQueue('payment-processing');

// Define job types
export const JOB_TYPES = {
  PROCESS_PAYMENT: 'process-payment',
  SEND_PAYMENT_CONFIRMATION: 'send-payment-confirmation',
  PAYMENT_RECONCILIATION: 'payment-reconciliation',
  PAYMENT_REFUND: 'payment-refund'
};

/**
 * Add a job to process a payment
 * @param {Object} paymentData - Payment data including orderId, userId, paymentMethodId
 * @param {Object} options - Job options
 * @returns {Promise<Job>} The created job
 */
export const addPaymentProcessingJob = async (paymentData, options = {}) => {
  return await paymentQueue.add(JOB_TYPES.PROCESS_PAYMENT, paymentData, {
    priority: 1, // High priority
    attempts: 3,
    ...options
  });
};

/**
 * Add a job to send payment confirmation
 * @param {Object} confirmationData - Data needed for confirmation email
 * @param {Object} options - Job options
 * @returns {Promise<Job>} The created job
 */
export const addPaymentConfirmationJob = async (confirmationData, options = {}) => {
  return await paymentQueue.add(JOB_TYPES.SEND_PAYMENT_CONFIRMATION, confirmationData, {
    priority: 2,
    delay: 1000, // Small delay to ensure payment is fully processed
    ...options
  });
};

/**
 * Add a job to reconcile payment with order
 * @param {Object} reconciliationData - Data needed for reconciliation
 * @param {Object} options - Job options
 * @returns {Promise<Job>} The created job
 */
export const addPaymentReconciliationJob = async (reconciliationData, options = {}) => {
  return await paymentQueue.add(JOB_TYPES.PAYMENT_RECONCILIATION, reconciliationData, {
    priority: 3,
    ...options
  });
};

/**
 * Add a job to process a refund
 * @param {Object} refundData - Refund data
 * @param {Object} options - Job options
 * @returns {Promise<Job>} The created job
 */
export const addRefundJob = async (refundData, options = {}) => {
  return await paymentQueue.add(JOB_TYPES.PAYMENT_REFUND, refundData, {
    priority: 1, // High priority for refunds
    ...options
  });
};

export default {
  JOB_TYPES,
  addPaymentProcessingJob,
  addPaymentConfirmationJob,
  addPaymentReconciliationJob,
  addRefundJob
};
