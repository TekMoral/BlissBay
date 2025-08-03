import mongoose from 'mongoose';

const { Schema } = mongoose;

const reviewRatingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
    reviewedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'FLAGGED'],
      default: 'ACTIVE'
    },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

// Virtual to get top-level comments for the review
reviewRatingSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'reviewId',
  justOne: false,
  match: { parentCommentId: null } // only top-level comments
});

// Include virtuals in outputs
reviewRatingSchema.set('toObject', { virtuals: true });
reviewRatingSchema.set('toJSON', { virtuals: true });

// Ensure user can only review a product once
reviewRatingSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model('Review', reviewRatingSchema);
