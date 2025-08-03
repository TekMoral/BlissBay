
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'processed', 'failed'],
    default: 'pending'
  },
  processedAt: {
    type: Date
  },
  attempts: {
    type: Number,
    default: 0
  },
  error: {
    type: String
  }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

