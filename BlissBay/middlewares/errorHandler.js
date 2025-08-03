import logger from '../config/logger.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Determine appropriate status code
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  
  // Log the error for debugging
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Default error message
  let message = err.message || 'Server Error';
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    message = messages.join(', ');
  }
  
  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export default errorHandler;
