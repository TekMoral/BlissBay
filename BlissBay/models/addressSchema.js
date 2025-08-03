import mongoose from 'mongoose';

const { Schema } = mongoose;

const addressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

// Pre-save middleware to ensure only one default address per user
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    const existingDefault = await this.constructor.findOne({
      userId: this.userId,
      isDefault: true,
      _id: { $ne: this._id } // Exclude the current address
    });

    // If another default exists, unset it
    if (existingDefault) {
      existingDefault.isDefault = false;
      await existingDefault.save();
    }
  }
  next();
});

// Static method to get a user's default address
addressSchema.statics.getDefaultAddress = async function (userId) {
  return this.findOne({ userId, isDefault: true });
};

export default mongoose.models.Address || mongoose.model('Address', addressSchema);
