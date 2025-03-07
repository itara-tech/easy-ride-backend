import Joi from 'joi';

export const validateUserRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    password: Joi.string().min(8).required(),
    userType: Joi.string().valid('CUSTOMER', 'DRIVER').required(),
  });

  return schema.validate(data);
};

export const validateUserUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    avatar: Joi.string().uri(),
  });

  return schema.validate(data);
};

export const validatePasswordChange = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  });

  return schema.validate(data);
};
