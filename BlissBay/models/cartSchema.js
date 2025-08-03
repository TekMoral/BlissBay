import mongoose from 'mongoose';
const { Schema } = mongoose;

const cartItemsSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
});

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemsSchema],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Method to calculate total
cartSchema.methods.calculateTotalAmount = function () {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

// Pre-save hook to always calculate totalAmount
cartSchema.pre('save', function (next) {
  this.calculateTotalAmount();
  next();
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);

