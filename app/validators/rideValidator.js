import Joi from 'joi';

export const validateRideRequest = (data) => {
  const schema = Joi.object({
    customerId: Joi.string().uuid().required(),
    source: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lon: Joi.number().min(-180).max(180).required(),
    }).required(),
    destination: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lon: Joi.number().min(-180).max(180).required(),
    }).required(),
  });

  return schema.validate(data);
};

export const validateRideAcceptance = (data) => {
  const schema = Joi.object({
    rideRequestId: Joi.string().uuid().required(),
    driverId: Joi.string().uuid().required(),
  });

  return schema.validate(data);
};

export const validateRideCompletion = (data) => {
  const schema = Joi.object({
    tripId: Joi.string().uuid().required(),
    finalAmount: Joi.number().positive().required(),
  });

  return schema.validate(data);
};

export const validateRideCancellation = (data) => {
  const schema = Joi.object({
    tripId: Joi.string().uuid().required(),
    reason: Joi.string().max(255).required(),
    canceledByType: Joi.string().valid('CUSTOMER', 'DRIVER').required(),
  });

  return schema.validate(data);
};
