import Joi from 'joi';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { createErrorResponse } from '../utils/helpers.js';

// Esquemas de validación para Persona
export const personaSchema = {
  create: Joi.object({
    nombre: Joi.string().min(2).max(100).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
    apellido: Joi.string().max(100).allow(null, '').messages({
      'string.max': 'El apellido no puede exceder 100 caracteres'
    }),
    telefono: Joi.string().max(20).pattern(/^[+]?[\d\s\-\$\$]{7,15}$/).allow(null, '').messages({
      'string.pattern.base': 'El teléfono tiene un formato inválido',
      'string.max': 'El teléfono no puede exceder 20 caracteres'
    }),
    email: Joi.string().email().max(100).allow(null, '').messages({
      'string.email': 'El email tiene un formato inválido',
      'string.max': 'El email no puede exceder 100 caracteres'
    }),
    direccion: Joi.string().allow(null, ''),
    cedula: Joi.string().max(20).pattern(/^[\d]{6,12}$/).allow(null, '').messages({
      'string.pattern.base': 'La cédula debe contener solo números y tener entre 6 y 12 dígitos',
      'string.max': 'La cédula no puede exceder 20 caracteres'
    }),
    fechaNacimiento: Joi.date().max('now').allow(null).messages({
      'date.max': 'La fecha de nacimiento no puede ser futura'
    }),
    notas: Joi.string().allow(null, ''),
    activo: Joi.boolean().default(true)
  }),
  
  update: Joi.object({
    nombre: Joi.string().min(2).max(100).messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),
    apellido: Joi.string().max(100).allow(null, ''),
    telefono: Joi.string().max(20).pattern(/^[+]?[\d\s\-\$\$]{7,15}$/).allow(null, ''),
    email: Joi.string().email().max(100).allow(null, ''),
    direccion: Joi.string().allow(null, ''),
    cedula: Joi.string().max(20).pattern(/^[\d]{6,12}$/).allow(null, ''),
    fechaNacimiento: Joi.date().max('now').allow(null),
    notas: Joi.string().allow(null, ''),
    activo: Joi.boolean()
  }).min(1)
};

// Esquemas de validación para Préstamo
export const prestamoSchema = {
  create: Joi.object({
    personaId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID de persona debe ser un número',
      'number.positive': 'El ID de persona debe ser positivo',
      'any.required': 'El ID de persona es obligatorio'
    }),
    montoTotal: Joi.number().positive().precision(2).max(999999999.99).required().messages({
      'number.positive': 'El monto total debe ser mayor a cero',
      'number.precision': 'El monto total debe tener máximo 2 decimales',
      'number.max': 'El monto total excede el límite permitido',
      'any.required': 'El monto total es obligatorio'
    }),
    tasaInteres: Joi.number().min(0).precision(2).max(99.99).default(0).messages({
      'number.min': 'La tasa de interés no puede ser negativa',
      'number.precision': 'La tasa de interés debe tener máximo 2 decimales',
      'number.max': 'La tasa de interés no puede exceder 99.99%'
    }),
    tipoPrestamo: Joi.string().valid('personal', 'comercial', 'emergencia', 'otro').default('personal'),
    descripcion: Joi.string().allow(null, ''),
    fechaVencimiento: Joi.date().min('now').allow(null).messages({
      'date.min': 'La fecha de vencimiento debe ser futura'
    }),
    plazoDias: Joi.number().integer().min(1).allow(null).messages({
      'number.min': 'El plazo en días debe ser al menos 1'
    }),
    cuotasPactadas: Joi.number().integer().min(1).default(1).messages({
      'number.min': 'Las cuotas pactadas deben ser al menos 1'
    })
  }),
  
  update: Joi.object({
    montoTotal: Joi.number().positive().precision(2).max(999999999.99),
    tasaInteres: Joi.number().min(0).precision(2).max(99.99),
    tipoPrestamo: Joi.string().valid('personal', 'comercial', 'emergencia', 'otro'),
    estado: Joi.string().valid('activo', 'completado', 'cancelado', 'vencido'),
    descripcion: Joi.string().allow(null, ''),
    fechaVencimiento: Joi.date().allow(null),
    plazoDias: Joi.number().integer().min(1).allow(null),
    cuotasPactadas: Joi.number().integer().min(1)
  }).min(1)
};

// Esquemas de validación para Pago
export const pagoSchema = {
  create: Joi.object({
    prestamoId: Joi.number().integer().positive().required().messages({
      'any.required': 'El ID del préstamo es obligatorio'
    }),
    monto: Joi.number().positive().precision(2).max(9999999.99).required().messages({
      'number.positive': 'El monto debe ser mayor a cero',
      'number.precision': 'El monto debe tener máximo 2 decimales',
      'any.required': 'El monto es obligatorio'
    }),
    montoCapital: Joi.number().min(0).precision(2).default(0),
    montoInteres: Joi.number().min(0).precision(2).default(0),
    montoMora: Joi.number().min(0).precision(2).default(0),
    metodoPago: Joi.string().valid('efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro').default('efectivo'),
    numeroTransaccion: Joi.string().max(50).allow(null, ''),
    descripcion: Joi.string().allow(null, ''),
    comprobanteUrl: Joi.string().uri().allow(null, ''),
    fechaProgramada: Joi.date().allow(null),
    esCuota: Joi.boolean().default(false),
    numeroCuota: Joi.number().integer().min(1).allow(null)
  })
};

// Middleware de validación
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(MESSAGES.ERROR.VALIDATION, HTTP_STATUS.BAD_REQUEST, details)
      );
    }

    req.body = value;
    next();
  };
};

// Validación de parámetros de URL
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse('Parámetros de URL inválidos', HTTP_STATUS.BAD_REQUEST)
      );
    }

    req.params = value;
    next();
  };
};

// Esquemas para parámetros de URL
export const paramsSchema = {
  id: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};