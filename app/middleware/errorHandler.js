import { ValidationError } from 'joi';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details.map((detail) => detail.message),
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
};
