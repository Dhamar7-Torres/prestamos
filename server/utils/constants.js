export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Recurso creado exitosamente',
    UPDATED: 'Recurso actualizado exitosamente',
    DELETED: 'Recurso eliminado exitosamente',
    FOUND: 'Recurso encontrado'
  },
  ERROR: {
    NOT_FOUND: 'Recurso no encontrado',
    BAD_REQUEST: 'Datos de entrada inválidos',
    INTERNAL_SERVER: 'Error interno del servidor',
    DUPLICATE: 'El recurso ya existe',
    VALIDATION: 'Error de validación'
  },
  PRESTAMO: {
    NOT_FOUND: 'Préstamo no encontrado',
    ALREADY_COMPLETED: 'El préstamo ya está completado',
    INVALID_PAYMENT: 'El monto del pago es inválido',
    PAYMENT_EXCEEDS_DEBT: 'El monto del pago excede la deuda restante'
  },
  PERSONA: {
    NOT_FOUND: 'Persona no encontrada',
    DUPLICATE_CEDULA: 'Ya existe una persona con esta cédula'
  }
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

export const TIPOS_PRESTAMO = {
  PERSONAL: 'personal',
  COMERCIAL: 'comercial',
  EMERGENCIA: 'emergencia',
  OTRO: 'otro'
};

export const ESTADOS_PRESTAMO = {
  ACTIVO: 'activo',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
  VENCIDO: 'vencido'
};

export const METODOS_PAGO = {
  EFECTIVO: 'efectivo',
  TRANSFERENCIA: 'transferencia',
  TARJETA: 'tarjeta',
  CHEQUE: 'cheque',
  OTRO: 'otro'
};

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONO: /^[+]?[\d\s\-\$\$]{7,15}$/,
  CEDULA: /^[\d]{6,12}$/,
  SOLO_NUMEROS: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/
};

export const LIMITS = {
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 100,
  TELEFONO_MAX: 20,
  EMAIL_MAX: 100,
  DESCRIPCION_MAX: 1000,
  MONTO_MIN: 0.01,
  MONTO_MAX: 999999999.99
};