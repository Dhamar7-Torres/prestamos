import personaService from '../services/personaService.js';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { createSuccessResponse, createErrorResponse, asyncHandler, validatePaginationParams, createPaginationResponse } from '../utils/helpers.js';

class PersonasController {
  // GET /api/personas
  obtenerTodas = asyncHandler(async (req, res) => {
    const { page, limit } = validatePaginationParams(req.query.page, req.query.limit);
    const { buscar, incluirInactivas } = req.query;

    const opciones = {
      page,
      limit,
      buscar,
      incluirInactivas: incluirInactivas === 'true'
    };

    const { personas, total } = await personaService.obtenerTodas(opciones);

    const response = createPaginationResponse(personas, page, limit, total);
    
    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(response, 'Personas obtenidas exitosamente')
    );
  });

  // GET /api/personas/:id
  obtenerPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const persona = await personaService.obtenerPorId(parseInt(id));

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(persona, MESSAGES.SUCCESS.FOUND)
    );
  });

  // POST /api/personas
  crear = asyncHandler(async (req, res) => {
    const persona = await personaService.crear(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(persona, MESSAGES.SUCCESS.CREATED)
    );
  });

  // PUT /api/personas/:id
  actualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const persona = await personaService.actualizar(parseInt(id), req.body);

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(persona, MESSAGES.SUCCESS.UPDATED)
    );
  });

  // DELETE /api/personas/:id
  eliminar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await personaService.eliminar(parseInt(id));

    res.status(HTTP_STATUS.NO_CONTENT).json(
      createSuccessResponse(null, MESSAGES.SUCCESS.DELETED)
    );
  });

  // GET /api/personas/:id/estadisticas
  obtenerEstadisticas = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const estadisticas = await personaService.obtenerEstadisticas(parseInt(id));

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(estadisticas, 'Estadísticas obtenidas exitosamente')
    );
  });
}

export default new PersonasController();