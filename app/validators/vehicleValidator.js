import Joi from 'joi';

export const validateVehicleCreation = (data) => {
  const schema = Joi.object({
    driverId: Joi.string().uuid().required(),
    model: Joi.string().required(),
    plate: Joi.string().required(),
    type: Joi.string().valid('CAR', 'SUV', 'TRUCK', 'BIKE').required(),
    color: Joi.string().required(),
  });

  return schema.validate(data);
};

export const validateVehicleUpdate = (data) => {
  const schema = Joi.object({
    model: Joi.string(),
    plate: Joi.string(),
    type: Joi.string().valid('CAR', 'SUV', 'TRUCK', 'BIKE'),
    color: Joi.string(),
    isActive: Joi.boolean(),
  });

  return schema.validate(data);
};
