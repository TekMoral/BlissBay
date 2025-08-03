import User from '../models/userSchema.js';
import crypto from 'crypto';

/**
 * Request password reset (forgot password)
 * @route POST /api/password/forgot
 * @access Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set token expiration (1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // In a real application, send an email with the reset link
    console.log(`Password reset link: ${resetUrl}`);

    res.status(200).json({
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * Reset password with token
 * @route POST /api/password/reset
 * @access Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find user by reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password.value');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Validate password strength using your existing logic
    const isValid = 
      /[A-Z]/.test(newPassword) && 
      /[a-z]/.test(newPassword) && 
      /\d/.test(newPassword) && 
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) && 
      newPassword.length >= 8;

    if (!isValid) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      });
    }

    // Update password
    user.password.value = newPassword;
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * Change password (when logged in)
 * @route POST /api/password/change
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    // Get user with password field included
    const user = await User.findById(req.user.id).select('+password.value');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.password.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const isSame = await user.password.comparePassword(newPassword);
    if (isSame) {
      return res.status(400).json({ message: 'New password cannot be the same as the current password' });
    }
    
    // Update password
    user.password.value = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * Validate password strength
 * @route POST /api/password/validate
 * @access Public
 */
export const validatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    // Use the same validation logic as in the schema
    const isValid = 
      /[A-Z]/.test(password) && 
      /[a-z]/.test(password) && 
      /\d/.test(password) && 
      /[!@#$%^&*(),.?":{}|<>]/.test(password) && 
      password.length >= 8;
    
    if (isValid) {
      return res.json({ valid: true });
    } else {
      return res.json({ 
        valid: false,
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      });
    }
  } catch (error) {
    console.error('Password validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};