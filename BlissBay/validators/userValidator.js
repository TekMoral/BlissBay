import Joi from 'joi';

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

// Reusable field validators - consistent with Mongoose schema and controller
export const fieldValidators = {
  name: Joi.string().min(2).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
  }),
  
  email: Joi.string()
    .pattern(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.pattern.base': 'Invalid email format',
    }),
  
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.pattern.base':
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
    }),
  
  phone: Joi.string()
    .pattern(/^\+?\d{10,15}$/)
    .allow('') // Optional field - consistent with controller
    .messages({
      'string.pattern.base': 'Phone number must be 10 to 15 digits (international format)',
    }),
  
  role: Joi.string()
    .valid('customer', 'admin')
    .default('customer')
    .messages({
      'any.only': 'Role must be either customer or admin',
    }),
  
  // Avatar is handled as a file upload and stored as a path
  avatar: Joi.string()
    .allow('') 
    .optional()
    .messages({
      'string.base': 'Avatar must be a string path or URL',
    }),
  
  street: Joi.string().required().messages({
    'string.empty': 'Street is required',
  }),
  
  city: Joi.string().required().messages({
    'string.empty': 'City is required',
  }),
  
  state: Joi.string().valid(...nigerianStates).required().messages({
    'any.only': 'State must be one of the valid Nigerian states',
    'string.empty': 'State is required',
  }),
  
  country: Joi.string().default('Nigeria').optional(),
  
  isDefault: Joi.boolean().default(true).optional(),
};

// Address schema for validation
export const addressSchema = Joi.object({
  street: fieldValidators.street,
  city: fieldValidators.city,
  state: fieldValidators.state,
  country: fieldValidators.country,
  isDefault: fieldValidators.isDefault
});

// Register user schema with nested address
export const registerUserSchema = Joi.object({
  name: fieldValidators.name,
  email: fieldValidators.email,
  password: fieldValidators.password,
  phone: fieldValidators.phone,
  role: fieldValidators.role.optional(),
  avatar: fieldValidators.avatar,
  address: addressSchema.required()
});

// Update user schema
export const updateUserSchema = Joi.object({
  name: fieldValidators.name.optional(),
  phone: fieldValidators.phone,
  avatar: fieldValidators.avatar,
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Login schema
export const loginSchema = Joi.object({
  email: fieldValidators.email,
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

// Forgot password schema
export const forgotPasswordSchema = Joi.object({
  email: fieldValidators.email,
});

// Change password schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
  }),
  newPassword: fieldValidators.password,
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'string.empty': 'Confirm password is required',
  }),
});

// Reset password schema
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token is required',
  }),
  password: fieldValidators.password,
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'string.empty': 'Confirm password is required',
  }),
});

// Suspend user Schema
export const suspendUserSchema = Joi.object({
  reason: Joi.string().max(255).optional()
});