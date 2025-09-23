import prestamoService from '../services/prestamoService.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { createSuccessResponse, createErrorResponse, asyncHandler, validatePaginationParams, createPaginationResponse } from '../utils/helpers.js';

class PrestamosController {
  // GET /api/prestamos
  obtenerTodos = asyncHandler(async (req, res) => {
    const { page, limit } = validatePaginationParams(req.query.page, req.query.limit);
    const { personaId, estado, completado, ordenarPor, orden } = req.query;

    const opciones = {
      page,
      limit,
      personaId,
      estado,
      completado,
      ordenarPor,
      orden
    };

    const { prestamos, total } = await prestamoService.obtenerTodos(opciones);

    const response = createPaginationResponse(prestamos, page, limit, total);
    
    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(response, 'Préstamos obtenidos exitosamente')
    );
  });

  // GET /api/prestamos/:id
  obtenerPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const prestamo = await prestamoService.obtenerPorId(parseInt(id));

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(prestamo, MESSAGES.SUCCESS.FOUND)
    );
  });

  // POST /api/prestamos
  crear = asyncHandler(async (req, res) => {
    const prestamo = await prestamoService.crear(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(prestamo, MESSAGES.SUCCESS.CREATED)
    );
  });

  // PUT /api/prestamos/:id
  actualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const prestamo = await prestamoService.actualizar(parseInt(id), req.body);

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(prestamo, MESSAGES.SUCCESS.UPDATED)
    );
  });

  // DELETE /api/prestamos/:id
  eliminar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prestamoService.eliminar(parseInt(id));

    res.status(HTTP_STATUS.NO_CONTENT).json(
      createSuccessResponse(null, MESSAGES.SUCCESS.DELETED)
    );
  });

  // GET /api/prestamos/estadisticas
  obtenerEstadisticas = asyncHandler(async (req, res) => {
    const estadisticas = await prestamoService.obtenerEstadisticas();

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(estadisticas, 'Estadísticas obtenidas exitosamente')
    );
  });

  // GET /api/prestamos/proximos-vencimientos
  obtenerProximosVencimientos = asyncHandler(async (req, res) => {
    const { dias = 7 } = req.query;
    const prestamos = await prestamoService.obtenerProximosVencimientos(parseInt(dias));

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(prestamos, 'Próximos vencimientos obtenidos exitosamente')
    );
  });

  // POST /api/prestamos/:id/recalcular
  recalcularTotales = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const prestamo = await prestamoService.recalcularTotales(parseInt(id));

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(prestamo, 'Totales recalculados exitosamente')
    );
  });
}

export default new PrestamosController();