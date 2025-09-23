import { REGEX, LIMITS } from './constants.js';

export const formatCurrency = (amount, currency = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date, locale = 'es-CO') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const formatDateOnly = (date, locale = 'es-CO') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Number(((value * 100) / total).toFixed(2));
};

export const isValidEmail = (email) => {
  return REGEX.EMAIL.test(email);
};

export const isValidTelefono = (telefono) => {
  return REGEX.TELEFONO.test(telefono);
};

export const isValidCedula = (cedula) => {
  return REGEX.CEDULA.test(cedula);
};

export const isValidDecimal = (value) => {
  return REGEX.DECIMAL.test(value.toString());
};

export const sanitizeString = (str) => {
  if (!str) return str;
  return str.trim().replace(/\s+/g, ' ');
};

export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const parseDecimal = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Number(parsed.toFixed(2));
};

export const validatePaginationParams = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(Math.max(1, parseInt(limit) || 10), LIMITS.MAX_LIMIT);
  return { page: validPage, limit: validLimit };
};

export const createPaginationResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

export const handlePrismaError = (error) => {
  // Manejar errores comunes de Prisma
  if (error.code === 'P2002') {
    return {
      status: 409,
      message: 'Ya existe un registro con estos datos únicos'
    };
  }
  
  if (error.code === 'P2025') {
    return {
      status: 404,
      message: 'Registro no encontrado'
    };
  }
  
  if (error.code === 'P2003') {
    return {
      status: 400,
      message: 'Error de referencia: el registro relacionado no existe'
    };
  }
  
  // Error genérico
  return {
    status: 500,
    message: 'Error de base de datos'
  };
};

export const logError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${context}:`, {
    message: error.message,
    stack: error.stack,
    code: error.code || 'NO_CODE'
  });
};

export const createSuccessResponse = (data, message, statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

export const createErrorResponse = (message, statusCode = 500, details = null) => {
  return {
    success: false,
    message,
    details,
    timestamp: new Date().toISOString()
  };
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};