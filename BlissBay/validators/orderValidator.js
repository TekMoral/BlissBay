import pkg from 'joi';
const Joi = pkg;

export const createOrderSchema = Joi.object({
  shippingAddress: Joi.string().required(), // should be ObjectId
  paymentMethod: Joi.string()
    .valid("credit_card", "paypal", "cod")
    .required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(), // should be ObjectId
        nameSnapshot: Joi.string().required(),
        categorySnapshot: Joi.string().required(),
        imageSnapshot: Joi.string().uri().optional(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().required(),
      })
    )
    .min(1)
    .required(),
  total: Joi.number().positive().required(),
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .optional(),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed", "refunded")
    .optional(),
  transactionId: Joi.when("paymentStatus", {
    is: "paid",
    then: Joi.string().required().messages({
      "any.required": "Transaction ID is required for paid orders."
    }),
    otherwise: Joi.string().optional(),
  }),
  estimatedDelivery: Joi.date().greater(Joi.ref("createdAt", {
    adjust: (value) => {
      const adjusted = new Date(value);
      adjusted.setHours(adjusted.getHours() + 48);
      return adjusted;
    }
  })).messages({
    "date.greater": "Estimated delivery must be at least 48 hours after order time."
  }).optional(),
});
