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
});