import Joi from 'joi';

export const validatePaymentProcess = (data) => {
  const schema = Joi.object({
    amount: Joi.number().positive().required(),
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
  });

  return schema.validate(data);
};

export const validateRefundProcess = (data) => {
  const schema = Joi.object({
    amount: Joi.number().positive().required(),
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    reason: Joi.string().max(255).required(),
  });

  return schema.validate(data);
};

export const validateTransactionQuery = (data) => {
  const schema = Joi.object({
    offset: Joi.number().min(0).default(0),
    limit: Joi.number().min(1).max(100).default(10),
  });

  return schema.validate(data);
};
