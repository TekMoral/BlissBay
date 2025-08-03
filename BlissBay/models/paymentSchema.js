import mongoose from 'mongoose';

/**
 * Payment Schema
 * Stores payment information for orders
 */
const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than 0']
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required']
    },
    status: {
      type: String,
      required: [true, 'Payment status is required'],
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    refundId: {
      type: String,
      default: null
    },
    refundAmount: {
      type: Number,
      default: null
    },
    refundedAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: Map,
      of: String,
      default: {}
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
paymentSchema.index({ userId: 1 });
paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual property to check if payment is successful
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Virtual property to check if payment is refunded
paymentSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded';
});

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, refundId) {
  this.status = 'refunded';
  this.refundId = refundId;
  this.refundAmount = amount || this.amount;
  this.refundedAt = new Date();
  return this.save();
};

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);