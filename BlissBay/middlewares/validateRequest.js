export const validateRequest = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
  
    if (error) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }
  
    req.body = value; // Cleaned and validated data
    next();
  };
  