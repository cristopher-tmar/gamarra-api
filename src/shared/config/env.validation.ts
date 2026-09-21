import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number()
    .port()
    .default(3000),

  DATABASE_URL: Joi.string()
    .uri()
    .required()
    .messages({
      'string.empty':
        'La variable DATABASE_URL es obligatoria',
      'string.uri':
        'La variable DATABASE_URL debe contener una URL válida',
      'any.required':
        'La variable DATABASE_URL es obligatoria',
    }),

  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.empty':
        'La variable JWT_SECRET es obligatoria',
      'string.min':
        'La variable JWT_SECRET debe tener al menos 32 caracteres',
      'any.required':
        'La variable JWT_SECRET es obligatoria',
  }),

  JWT_EXPIRES_IN: Joi.string()
    .default('15m')
    .messages({
      'string.empty':
        'La variable JWT_EXPIRES_IN no puede estar vacía',
  }),
});