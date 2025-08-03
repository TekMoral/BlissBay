import mongoose from 'mongoose';
const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    productId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product',
      required: true 
    },
    nameSnapshot: {
      type: String,
      required: true
    },
    categorySnapshot: {
      type: String,
      required: true
    },
    imageSnapshot: {
      type: String // URL or file path
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1 
    },
    price: { 
      type: Number, 
      required: true 
    },
  }],
  total: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  shippingAddress: { 
    type: Schema.Types.ObjectId, 
    ref: 'Address', 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ["credit_card", "paypal", "cod"],
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  transactionId: {
    type: String,
    validate: {
      validator: function (value) {
        return this.paymentStatus === "paid" ? !!value : true;
      },
      message: "Transaction ID is required for paid orders."
    }
  },
  createdAt: { type: Date, default: Date.now },
  estimatedDelivery: {
    type: Date,
    validate: {
      validator: function (value) {
        const createdAt = this.get('createdAt') || new Date();
        const minDeliveryDate = new Date(createdAt);
        minDeliveryDate.setHours(minDeliveryDate.getHours() + 48); // Adds 48 hours
        return value >= minDeliveryDate;
      },
      message: "Estimated delivery must be at least 48 hours after order time."
    }
  },
});

// Automatically calculate total before saving
orderSchema.pre('save', function (next) {
  this.total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  next();
});

orderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
