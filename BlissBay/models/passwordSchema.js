import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const passwordSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    select: false, // Prevent password from being exposed in queries
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to validate and hash the password
passwordSchema.pre('save', async function (next) {
  // Skip if password isn't modified
  if (!this.isModified('value')) return next();

  // Store original plain password for validation
  const plainPassword = this.value;

  // Validate password before hashing
  const isValid =
    /[A-Z]/.test(plainPassword) &&
    /[a-z]/.test(plainPassword) &&
    /\d/.test(plainPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(plainPassword) &&
    plainPassword.length >= 8;

  if (!isValid) {
    return next(
      new Error(
        'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
      )
    );
  }

  // Hash the password
  const salt = await bcrypt.genSalt(12);
  this.value = await bcrypt.hash(plainPassword, salt);
  this.lastUpdated = Date.now();

  next();
});

// Password comparison method
passwordSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.value);
};

export default mongoose.models.Password || mongoose.model('Password', passwordSchema);
