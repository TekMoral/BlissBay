import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

// ✅ Reusable Cart Item Schema
export const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// ✅ User Schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^\+?\d{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
    defaultAddress: { type: Schema.Types.ObjectId, ref: 'Address' },
  
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^(\/uploads\/avatars\/.*|https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i.test(v);
        },
        message: 'Invalid avatar path or URL!',
      },
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    cart: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
  }
);

// ✅ Password Hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const plainPassword = this.password;
  const isStrong =
    /[A-Z]/.test(plainPassword) &&
    /[a-z]/.test(plainPassword) &&
    /\d/.test(plainPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(plainPassword) &&
    plainPassword.length >= 8;

  if (!isStrong) {
    return next(
      new Error(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      )
    );
  }

  this.password = await bcrypt.hash(plainPassword, 12);
  next();
});

// ✅ Password Verification Method
userSchema.methods.verifyPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Address Schema
const addressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'Nigeria',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

//  Model Exports
const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);

export default User;
