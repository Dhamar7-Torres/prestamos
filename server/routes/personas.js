import express from 'express';
import personasController from '../controllers/personasController.js';
import { validate, validateParams, personaSchema, paramsSchema } from '../middleware/validation.js';

const router = express.Router();

// GET /api/personas - Obtener todas las personas
router.get('/', personasController.obtenerTodas);

// GET /api/personas/:id - Obtener persona por ID
router.get('/:id', 
  validateParams(paramsSchema.id),
  personasController.obtenerPorId
);

// POST /api/personas - Crear nueva persona
router.post('/', 
  validate(personaSchema.create),
  personasController.crear
);

// PUT /api/personas/:id - Actualizar persona
router.put('/:id', 
  validateParams(paramsSchema.id),
  validate(personaSchema.update),
  personasController.actualizar
);

// DELETE /api/personas/:id - Eliminar persona
router.delete('/:id', 
  validateParams(paramsSchema.id),
  personasController.eliminar
);

// GET /api/personas/:id/estadisticas - Obtener estadísticas de una persona
router.get('/:id/estadisticas', 
  validateParams(paramsSchema.id),
  personasController.obtenerEstadisticas
);

export default router;