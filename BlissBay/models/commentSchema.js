import mongoose from 'mongoose';
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true }, // links to review
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true, required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null } // optional reply
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);
