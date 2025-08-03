
// jwtHelper.js
import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for authentication
 * @param {string} userId 
 * @param {string} role 
 * @returns {string} JWT token
 */
export const generateToken = (userId, role) => {
  const payload = {
    id: userId,
    role: role,
  };
  const secret = process.env.JWT_SECRET || 'your_secret_key';
  
  // Use JWT_TOKEN_EXPIRY from env or default to 3h
  const expiresIn = process.env.JWT_TOKEN_EXPIRY ? 
    parseInt(process.env.JWT_TOKEN_EXPIRY) / 1000 + 's' : // Convert ms to seconds for jwt
    '3h';
    
  const options = { expiresIn };
  return jwt.sign(payload, secret, options);
};

