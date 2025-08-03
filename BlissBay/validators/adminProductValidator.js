// BlissBay/validators/adminProductValidator.js
import Joi from 'joi';
import { PRODUCT_FLAGS } from "../constants/productFlags.js";

// Create a schema object with flag validations
const productFlagValidations = PRODUCT_FLAGS.reduce((schema, flag) => {
  schema[flag] = Joi.boolean().optional();
  return schema;
}, {});

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  description: Joi.string().trim().allow('', null),
  price: Joi.number().positive().precision(2).required(),
  discountedPrice: Joi.number().min(0).precision(2).optional().allow(null),
  stock: Joi.number().integer().min(0).default(0),
  category: Joi.string().trim().required(), // Should be ObjectId
  sellerId: Joi.string().trim().required(), // Should be ObjectId
  images: Joi.array().items(Joi.string().trim()).optional(),
  brand: Joi.string().trim().allow('', null).optional(),
  attributes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required(),
        value: Joi.string().trim().required(),
      })
    )
    .default([]),
  // Add all flag validations
  ...productFlagValidations
});

export const createManyProductsSchema = Joi.array().items(createProductSchema).min(1);

export const updateProductSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(""),
  price: Joi.number().positive(),
  discountedPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  category: Joi.string(),
  brand: Joi.string(),
  attributes: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required(),
    })
  ),
  // Add all flag validations to update schema as well
  ...productFlagValidations
});