import mongoose from "mongoose";
import User from "../models/userSchema.js";
import { generateToken } from "../utils/jwtHelper.js";
import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";
import crypto from "crypto";
import Order from "../models/orderSchema.js";
import Cart from "../models/cartSchema.js";
import Review from "../models/reviewRatingSchema.js";
import Address from "../models/addressSchema.js";
import bcrypt from "bcryptjs";
import sanitizeHtml from 'sanitize-html';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';


import {
  loginSchema,
  updateUserSchema,
  registerUserSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} from "../validators/userValidator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const loginUser = async (req, res) => {
  try {
    // ✅ Validate input using Joi schema
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: error.details.map(detail => detail.message) 
      });
    }

    const { email, password } = value;

   const user = await User.findOne({ email })
      .select('+password')
      .populate('addresses')
      .populate('defaultAddress');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account is suspended.' });
    }

    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Use the utility
    const token = generateToken(user._id, user.role);


     res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        addresses: user.addresses || [],
        defaultAddress: user.defaultAddress || null,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//✅Register User
export const registerUser = async (req, res) => {
  let session;

  try {
    console.log('Incoming request data:', {
      body: req.body,
      file: req.file ? req.file.filename : 'none'
    });

    let avatarUrl = null;

    // Handle Avatar Upload with Multer
    if (req.file) {
      // With Multer, the file is already uploaded and available as req.file
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
      console.log('✅ Avatar uploaded successfully:', avatarUrl);
    }

    //  Extract and normalize request data
    const {
      name,
      email,
      password,
      phone,
      role = 'customer',
      // Individual address fields (legacy support)
      street,
      city,
      state,
      country,
      // Address object (preferred)
      address
    } = req.body;

    //  Process address data 
    let addressData = {};
    if (address) {
      // If address is provided as an object
      addressData = typeof address === 'string' ? JSON.parse(address) : address;
    } else {
      // If address is provided as individual fields
      addressData = {
        street,
        city,
        state,
        country: country || 'Nigeria',
        isDefault: true
      };
    }

    // Prepare validation data
    const validationData = {
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      password,
      phone: phone?.trim() || '',
      role,
      avatar: avatarUrl || '',
      address: addressData
    };

    console.log('🧪 Data prepared for validation:', {
      ...validationData,
      password: '[HIDDEN]'
    });

    // Comprehensive Joi validation
    const { error, value } = registerUserSchema.validate(validationData, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      console.error('❌ Validation failed:', error.details);
      
      // Format validation errors for better UX
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors,
        count: validationErrors.length
      });
    }

    // Use validated and sanitized data
    const validatedData = value;

    //  Database transaction with proper error handling
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check for existing user
      const existingUser = await User.findOne({ 
        email: validatedData.email 
      }).session(session);
      
      if (existingUser) {
        await session.abortTransaction();
        return res.status(409).json({ 
          error: 'An account with this email already exists',
          field: 'email'
        });
      }

      // Create user with validated data
      const user = new User({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password, 
        phone: validatedData.phone,
        avatar: validatedData.avatar,
        role: validatedData.role
      });

      const savedUser = await user.save({ session });

      // Create Address
      const sanitizedAddress = {
        userId: savedUser._id,
        street: sanitizeHtml(validatedData.address.street), 
        city: sanitizeHtml(validatedData.address.city),     
        state: sanitizeHtml(validatedData.address.state),   
        country: sanitizeHtml(validatedData.address.country), 
        isDefault: true
      };

      const [savedAddress] = await Address.create([sanitizedAddress], { session });

      // Link address to user and save
      savedUser.defaultAddress = savedAddress._id;
      savedUser.addresses = [savedAddress._id];
      await savedUser.save({ session });

      // Commit transaction
      await session.commitTransaction();

      console.log('✅ User registered successfully:', {
        id: savedUser._id,
        email: savedUser.email
      });

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          avatar: savedUser.avatar,
          hasAddress: true
        }
      });

    } catch (dbError) {
      await session.abortTransaction();
      throw dbError; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }
    
    console.error('🔥 Registration error:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      const mongoErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({ 
        error: 'Database validation failed',
        details: mongoErrors
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        error: `${field} already exists`,
        field
      });
    }

    // Generic server error
    return res.status(500).json({ 
      error: 'Registration failed. Please try again later.',
      requestId: Date.now() // For debugging
    });

  } finally {
    if (session) {
      session.endSession();
    }
  }
};


/**
 * Helper function to calculate total spending by a user
 * @param {ObjectId} userId - The user ID to calculate spending for
 * @returns {Promise<Number>} - Total amount spent by user
 */

const calculateUserSpending = async (userId) => {
  try {
    console.log('Calculating spending for user:', userId);

    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error('Invalid ObjectId format:', userId, error.message);
      return 0;
    }

    const result = await Order.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: "delivered", // this matches your schema
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }, // fixed field name
        },
      },
    ]);

    return result[0]?.total || 0;
  } catch (error) {
    console.error("Error calculating user spending:", error);
    return 0;
  }
};


export const updateProfile = async (req, res) => {
  try {
    // Prepare form data
    const formData = {
      name: req.body.name,
      phone: req.body.phone,
      avatar: req.files?.avatarImage ? `/uploads/avatars/avatar_${Date.now()}.${req.files.avatarImage.name.split('.').pop()}` : undefined
    };

    // Validate input using Joi schema
    const { error, value } = updateUserSchema.validate(formData);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Begin transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(req.user.id).session(session);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Handle avatar upload
      if (req.files && req.files.avatarImage) {
        const avatarFile = req.files.avatarImage;
        if (!avatarFile.mimetype.startsWith('image/')) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ success: false, message: 'Please upload a valid image file' });
        }

        const timestamp = Date.now();
        const extension = avatarFile.name.split('.').pop();
        const filename = `avatar_${timestamp}.${extension}`;
        const uploadPath = path.join(__dirname, '../uploads/avatars', filename);

        await avatarFile.mv(uploadPath);
        user.avatar = `/uploads/avatars/${filename}`;
      }

      // Update user fields
      if (value.name) user.name = sanitizeHtml(value.name);
      if (value.phone) user.phone = value.phone;
      await user.save({ session });

      // Address updates if provided
      const { street, city, state } = req.body;
      if (street || city || state) {
        const address = await Address.findOne({ userId: user._id }).session(session);
        if (address) {
          if (street) address.street = sanitizeHtml(street);
          if (city) address.city = sanitizeHtml(city);
          if (state) address.state = sanitizeHtml(state);
          await address.save({ session });
        } else {
          await Address.create([{
            userId: user._id,
            street: sanitizeHtml(street || ''),
            city: sanitizeHtml(city || ''),
            state: sanitizeHtml(state || ''),
            country: 'Nigeria',
            isDefault: true
          }], { session });
        }
      }

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: 'Profile updated successfully' });

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('❌ Transaction error:', err);
      return res.status(500).json({ success: false, message: 'Profile update failed' });
    }

  } catch (err) {
    console.error('🔥 Error in updateProfile:', err);
    return res.status(500).json({ success: false, message: 'Server error during profile update' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const isSamePassword = await user.password.comparePassword(newPassword); // Assumes custom schema method
    if (isSamePassword) {
      return res
        .status(400)
        .json({
          message: "New password cannot be the same as the old password",
        });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Error updating user password", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({
          message:
            "If your email exists in our system, you will receive a password reset link",
        });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const transporter = nodemailer.createTransport(
      sgTransport({
        auth: {
          api_key: process.env.SENDGRID_API_KEY,
        },
      })
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({
        message:
          "If your email exists in our system, you will receive a password reset link",
      });
  } catch (error) {
    console.log("Error sending reset password link", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log("Error resetting password", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ message: "password confirmation is required" });
    }

    const userId = req.user.id;
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    await Order.deleteMany({ userId });
    await Cart.deleteMany({ userId });
    await Review.updateMany(
      { userId },
      { $set: { userId: null, deleted: true } }
    );

    await user.deleteOne();

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error deleting user account", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Display user profile
export const displayProfile = async (req, res) => {
  try {
    console.log('Display profile request received');
    console.log('User from token:', req.user);
    
    const requester = req.user;
    if (!requester) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdToFetch = req.params.userId || requester.id;
    console.log('Fetching profile for user ID:', userIdToFetch);

    if (userIdToFetch !== requester.id && requester.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const user = await User.findById(userIdToFetch)
        .select("-password -__v")
        .populate('addresses')
        .populate('defaultAddress');

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get additional user metrics with error handling
      let totalSpent = 0;
      try {
        totalSpent = await calculateUserSpending(userIdToFetch);
      } catch (err) {
        console.error('Error calculating spending:', err);
        // Continue with totalSpent = 0
      }
      
      // Only get these metrics if it's the user's own profile or an admin
      let additionalData = { totalSpent };
      
      if (userIdToFetch === requester.id || requester.role === "admin") {
        let orderCount = 0;
        let reviewCount = 0;
        
        try {
          orderCount = await Order.countDocuments({ userId: userIdToFetch });
        } catch (err) {
          console.error('Error counting orders:', err);
        }
        
        try {
          reviewCount = await Review.countDocuments({ userId: userIdToFetch });
        } catch (err) {
          console.error('Error counting reviews:', err);
        }
        
        additionalData = {
          ...additionalData,
          orderCount,
          reviewCount,
          joinedDate: user.createdAt
        };
      }

      console.log('Sending profile response');
      return res.status(200).json({
        success: true,
        data: {
          ...user.toObject(),
          ...additionalData
        },
      });
    } catch (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({ message: "Error retrieving user data" });
    }
  } catch (error) {
    console.error("Error in displayProfile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
