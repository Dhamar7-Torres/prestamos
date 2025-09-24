import pagoService from '../services/pagoService.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { createSuccessResponse, createErrorResponse, asyncHandler, validatePaginationParams, createPaginationResponse } from '../utils/helpers.js';

class PagosController {
  // GET /api/pagos
  obtenerTodos = asyncHandler(async (req, res) => {
    const { page, limit } = validatePaginationParams(req.query.page, req.query.limit);
    const { 
      prestamoId, 
      personaId, 
      metodoPago, 
      fechaDesde, 
      fechaHasta, 
      ordenarPor, 
      orden 
    } = req.query;

    const opciones = {
      page,
      limit,
      prestamoId,
      personaId,
      metodoPago,
      fechaDesde,
      fechaHasta,
      ordenarPor,
      orden
    };

    const { pagos, total } = await pagoService.obtenerTodos(opciones);

    const response = createPaginationResponse(pagos, page, limit, total);
    
    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(response, 'Pagos obtenidos exitosamente')
    );
  });

  // GET /api/pagos/:id
  obtenerPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pago = await pagoService.obtenerPorId(parseInt(id));

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(pago, MESSAGES.SUCCESS.FOUND)
    );
  });

  // POST /api/pagos
  crear = asyncHandler(async (req, res) => {
    console.log('🔍 Datos recibidos en controlador:', req.body);
    
    // El servicio se encarga de filtrar los campos válidos
    const resultado = await pagoService.crear(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(resultado, 'Pago registrado exitosamente')
    );
  });

  // PUT /api/pagos/:id
  actualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    console.log('🔍 Datos de actualización recibidos:', req.body);
    
    // El servicio se encarga de filtrar los campos válidos
    const pago = await pagoService.actualizar(parseInt(id), req.body);

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(pago, MESSAGES.SUCCESS.UPDATED)
    );
  });

  // DELETE /api/pagos/:id
  eliminar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await pagoService.eliminar(parseInt(id));

    res.status(HTTP_STATUS.NO_CONTENT).json(
      createSuccessResponse(null, MESSAGES.SUCCESS.DELETED)
    );
  });

  // GET /api/pagos/estadisticas/metodos
  obtenerEstadisticasPorMetodo = asyncHandler(async (req, res) => {
    const estadisticas = await pagoService.obtenerEstadisticasPorMetodo();

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(estadisticas, 'Estadísticas por método obtenidas exitosamente')
    );
  });

  // GET /api/pagos/periodo
  obtenerPagosPorPeriodo = asyncHandler(async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse('fechaInicio y fechaFin son requeridos', HTTP_STATUS.BAD_REQUEST)
      );
    }

    const resultado = await pagoService.obtenerPagosPorPeriodo(fechaInicio, fechaFin);

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(resultado, 'Pagos por período obtenidos exitosamente')
    );
  });

  // GET /api/pagos/persona/:personaId/historial
  obtenerHistorialPersona = asyncHandler(async (req, res) => {
    const { personaId } = req.params;
    const { limite = 10 } = req.query;

    const pagos = await pagoService.obtenerHistorialPersona(parseInt(personaId), parseInt(limite));

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(pagos, 'Historial de pagos obtenido exitosamente')
    );
  });
}

export default new PagosController();