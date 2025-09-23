import express from 'express';
import Joi from 'joi';
import pagosController from '../controllers/pagosController.js';
import { validate, validateParams, pagoSchema, paramsSchema } from '../middleware/validation.js';

const router = express.Router();

// Esquema de validación para personaId en parámetros
const personaIdSchema = Joi.object({
  personaId: Joi.number().integer().positive().required()
});

// GET /api/pagos/estadisticas/metodos - Debe ir antes de /:id
router.get('/estadisticas/metodos', pagosController.obtenerEstadisticasPorMetodo);

// GET /api/pagos/periodo - Obtener pagos por período
router.get('/periodo', pagosController.obtenerPagosPorPeriodo);

// GET /api/pagos/persona/:personaId/historial - Historial de pagos por persona
router.get('/persona/:personaId/historial', 
  validateParams(personaIdSchema),
  pagosController.obtenerHistorialPersona
);

// GET /api/pagos - Obtener todos los pagos
router.get('/', pagosController.obtenerTodos);

// GET /api/pagos/:id - Obtener pago por ID
router.get('/:id', 
  validateParams(paramsSchema.id),
  pagosController.obtenerPorId
);

// POST /api/pagos - Crear nuevo pago
router.post('/', 
  validate(pagoSchema.create),
  pagosController.crear
);

// PUT /api/pagos/:id - Actualizar pago
router.put('/:id', 
  validateParams(paramsSchema.id),
  validate(pagoSchema.create.fork(['prestamoId', 'monto'], (schema) => schema.optional())),
  pagosController.actualizar
);

// DELETE /api/pagos/:id - Eliminar pago
router.delete('/:id', 
  validateParams(paramsSchema.id),
  pagosController.eliminar
);

export default router;