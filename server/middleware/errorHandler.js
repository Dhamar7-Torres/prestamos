import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { handlePrismaError, logError, createErrorResponse } from '../utils/helpers.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  logError(err, `${req.method} ${req.originalUrl}`);

  // Error de Prisma
  if (err.code && err.code.startsWith('P')) {
    const prismaError = handlePrismaError(err);
    return res.status(prismaError.status).json(
      createErrorResponse(prismaError.message, prismaError.status)
    );
  }

  // Error de validación de Joi
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      createErrorResponse(message, HTTP_STATUS.BAD_REQUEST)
    );
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      createErrorResponse('JSON mal formateado', HTTP_STATUS.BAD_REQUEST)
    );
  }

  // Error personalizado con status
  if (err.status) {
    return res.status(err.status).json(
      createErrorResponse(err.message, err.status)
    );
  }

  // Error por defecto
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
    createErrorResponse(
      process.env.NODE_ENV === 'production' 
        ? MESSAGES.ERROR.INTERNAL_SERVER 
        : err.message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  );
};

export default errorHandler;