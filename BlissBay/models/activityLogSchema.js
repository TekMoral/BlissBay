// backend/models/activityLogSchema.js
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  entityType: { type: String, required: true },        // e.g., 'Order'
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, required: true },            // e.g., 'STATUS_UPDATE'
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

