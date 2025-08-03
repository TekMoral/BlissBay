import mongoose from 'mongoose';
const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Middleware to check if coupon is expired
couponSchema.pre('save', function (next) {
  if (this.expiryDate < new Date()) {
    this.status = 'expired';
  }
  next();
});

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
