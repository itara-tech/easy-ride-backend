import Joi from 'joi';
import { PaymentGateway, PaymentMethod, PaymentStatus } from '@prisma/client';

// Helper function to handle validation
const validate = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(error.details.map((d) => d.message).join(', '));
  }
  return value;
};

// Validation schemas
const schemas = {
  payment: Joi.object({
    amount: Joi.number().positive().precision(2).required(),
    phoneNumber: Joi.when('paymentGateway', {
      is: 'PAYPACK',
      then: Joi.string()
        .pattern(/^\+?[0-9]{10,15}$/)
        .required(),
      otherwise: Joi.string()
        .pattern(/^\+?[0-9]{10,15}$/)
        .optional(),
    }),
    description: Joi.string().max(255).optional(),
    tripId: Joi.string().uuid().required(),
    paymentGateway: Joi.string()
      .valid(...Object.values(PaymentGateway))
      .required(),
    paymentMethod: Joi.when('paymentGateway', {
      is: 'SIMPLE',
      then: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .required(),
      otherwise: Joi.forbidden(),
    }),
  }).options({ abortEarly: false }),

  refund: Joi.object({
    amount: Joi.number().positive().precision(2).required(),
    phoneNumber: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .optional(),
    tripId: Joi.string().uuid().required(),
    reason: Joi.string().max(500).required(),
  }).options({ abortEarly: false }),

  statusCheck: Joi.object({
    reference: Joi.string()
      .pattern(/^[A-Z0-9-]+$/)
      .required(),
    gateway: Joi.string()
      .valid(...Object.values(PaymentGateway))
      .required(),
  }).options({ abortEarly: false }),

  paymentHistory: Joi.object({
    offset: Joi.number().integer().min(0).default(0),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string()
      .valid(...Object.values(PaymentStatus))
      .optional(),
    gateway: Joi.string()
      .valid(...Object.values(PaymentGateway))
      .optional(),
  }).options({ abortEarly: false }),

  webhook: Joi.object({
    event: Joi.string().required(),
    data: Joi.object().required(),
    timestamp: Joi.date().iso().required(),
  }).options({ abortEarly: false }),
};

// Middleware functions
export const validatePayment = (req, res, next) => {
  try {
    req.body = validate(schemas.payment, req.body);
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const validateRefund = (req, res, next) => {
  try {
    req.body = validate(schemas.refund, req.body);
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const validateStatusCheck = (req, res, next) => {
  try {
    req.params = validate(schemas.statusCheck, {
      ...req.params,
      ...req.query,
    });
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const validatePaymentHistory = (req, res, next) => {
  try {
    req.query = validate(schemas.paymentHistory, req.query);
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const validateWebhook = (req, res, next) => {
  try {
    req.body = validate(schemas.webhook, req.body);
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
