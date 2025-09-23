import express from 'express';
import prestamosController from '../controllers/prestamosController.js';
import { validate, validateParams, prestamoSchema, paramsSchema } from '../middleware/validation.js';

const router = express.Router();

// GET /api/prestamos/estadisticas - Debe ir antes de /:id para evitar conflictos
router.get('/estadisticas', prestamosController.obtenerEstadisticas);

// GET /api/prestamos/proximos-vencimientos
router.get('/proximos-vencimientos', prestamosController.obtenerProximosVencimientos);

// GET /api/prestamos - Obtener todos los préstamos
router.get('/', prestamosController.obtenerTodos);

// GET /api/prestamos/:id - Obtener préstamo por ID
router.get('/:id', 
  validateParams(paramsSchema.id),
  prestamosController.obtenerPorId
);

// POST /api/prestamos - Crear nuevo préstamo
router.post('/', 
  validate(prestamoSchema.create),
  prestamosController.crear
);

// PUT /api/prestamos/:id - Actualizar préstamo
router.put('/:id', 
  validateParams(paramsSchema.id),
  validate(prestamoSchema.update),
  prestamosController.actualizar
);

// DELETE /api/prestamos/:id - Eliminar préstamo
router.delete('/:id', 
  validateParams(paramsSchema.id),
  prestamosController.eliminar
);

// POST /api/prestamos/:id/recalcular - Recalcular totales
router.post('/:id/recalcular', 
  validateParams(paramsSchema.id),
  prestamosController.recalcularTotales
);

export default router;