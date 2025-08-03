import pkg from 'joi';
const Joi = pkg;

export const commentSchema = Joi.object({
  reviewId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Review ID must be a valid ObjectId',
    'string.length': 'Review ID must be 24 characters long',
    'any.required': 'Review ID is required'
  }),
  userId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'User ID must be a valid ObjectId',
    'string.length': 'User ID must be 24 characters long',
    'any.required': 'User ID is required'
  }),
  content: Joi.string().trim().min(1).required().messages({
    'string.min': 'Content must have at least 1 character',
    'string.required': 'Content is required'
  }),
  parentCommentId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Parent Comment ID must be a valid ObjectId',
    'string.length': 'Parent Comment ID must be 24 characters long'
  })
});
