// Constantes para el frontend
export const APP_CONFIG = {
  NAME: 'Gestión de Préstamos',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de gestión de préstamos y pagos'
};

export const API_ENDPOINTS = {
  BASE: '/api',
  PERSONAS: '/api/personas',
  PRESTAMOS: '/api/prestamos',
  PAGOS: '/api/pagos',
  HEALTH: '/api/health'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
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

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50
};

export const VALIDATION_RULES = {
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 100,
  TELEFONO_MAX: 20,
  EMAIL_MAX: 100,
  DESCRIPCION_MAX: 1000,
  MONTO_MIN: 0.01,
  MONTO_MAX: 999999999.99
};

export const ROUTES = {
  HOME: '/',
  PRESTAMOS_PENDIENTES: '/pendientes',
  PRESTAMOS_COMPLETADOS: '/completados',
  PERSONAS: '/personas',
  ESTADISTICAS: '/estadisticas',
  CONFIGURACION: '/configuracion'
};

export const LOCAL_STORAGE_KEYS = {
  USER_PREFERENCES: 'prestamos_user_preferences',
  AUTH_DATA: 'prestamos_auth_data', 
  THEME: 'prestamos_theme',
  LANGUAGE: 'prestamos_language',
  FILTERS: 'prestamos_filters'
} as const;

export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Creado exitosamente',
    UPDATED: 'Actualizado exitosamente',
    DELETED: 'Eliminado exitosamente',
    PAYMENT_REGISTERED: 'Pago registrado exitosamente'
  },
  ERROR: {
    GENERIC: 'Ha ocurrido un error inesperado',
    NETWORK: 'Error de conexión. Verifica tu internet.',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION: 'Por favor verifica los datos ingresados',
    UNAUTHORIZED: 'No tienes permisos para esta acción',
    PAYMENT_EXCEEDS: 'El pago excede la deuda restante'
  },
  CONFIRM: {
    DELETE: '¿Estás seguro de que deseas eliminar este elemento?',
    CANCEL: '¿Estás seguro de que deseas cancelar?'
  }
};

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const CURRENCY_CONFIG = {
  LOCALE: 'es-CO',
  CURRENCY: 'COP',
  SYMBOL: '$'
};

export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  MONTH_YEAR: 'MMMM yyyy'
};

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s\-\$\$]{7,15}$/,
  CEDULA: /^[\d]{6,12}$/,
  ONLY_NUMBERS: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/
};