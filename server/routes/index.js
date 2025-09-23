import express from 'express';
import personasRoutes from './personas.js';
import prestamosRoutes from './prestamos.js';
import pagosRoutes from './pagos.js';

const router = express.Router();

// Rutas principales
router.use('/personas', personasRoutes);
router.use('/prestamos', prestamosRoutes);
router.use('/pagos', pagosRoutes);

// Información general de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Gestión de Préstamos',
    version: '1.0.0',
    endpoints: {
      personas: '/api/personas',
      prestamos: '/api/prestamos',
      pagos: '/api/pagos',
      health: '/api/health'
    },
    documentation: 'Consulta la documentación para más detalles'
  });
});

export default router;