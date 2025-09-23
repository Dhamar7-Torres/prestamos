import { REGEX, LIMITS } from './constants.js';

// Validadores personalizados para tipos de datos específicos
export const validators = {
  // Validación de email
  isValidEmail: (email) => {
    if (!email) return true; // Campo opcional
    return REGEX.EMAIL.test(email);
  },

  // Validación de teléfono
  isValidPhone: (phone) => {
    if (!phone) return true; // Campo opcional
    return REGEX.TELEFONO.test(phone);
  },

  // Validación de cédula
  isValidCedula: (cedula) => {
    if (!cedula) return true; // Campo opcional
    return REGEX.CEDULA.test(cedula);
  },

  // Validación de monto decimal
  isValidAmount: (amount) => {
    if (typeof amount === 'string') {
      return REGEX.DECIMAL.test(amount);
    }
    return typeof amount === 'number' && amount >= 0;
  },

  // Validación de fecha
  isValidDate: (date) => {
    if (!date) return true;
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate);
  },

  // Validación de fecha futura
  isFutureDate: (date) => {
    if (!date) return true;
    const parsedDate = new Date(date);
    return parsedDate > new Date();
  },

  // Validación de fecha pasada
  isPastDate: (date) => {
    if (!date) return true;
    const parsedDate = new Date(date);
    return parsedDate < new Date();
  },

  // Validación de rango de caracteres
  isValidLength: (str, min = 0, max = 255) => {
    if (!str) return min === 0;
    return str.length >= min && str.length <= max;
  },

  // Validación de números positivos
  isPositiveNumber: (num) => {
    return typeof num === 'number' && num > 0;
  },

  // Validación de números enteros
  isInteger: (num) => {
    return Number.isInteger(num);
  },

  // Validación de URL
  isValidUrl: (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// Validaciones específicas para modelos
export const modelValidators = {
  // Validaciones para Persona
  persona: {
    nombre: (nombre) => {
      return validators.isValidLength(nombre, LIMITS.NOMBRE_MIN, LIMITS.NOMBRE_MAX);
    },
    
    email: (email) => {
      return validators.isValidEmail(email);
    },
    
    telefono: (telefono) => {
      return validators.isValidPhone(telefono);
    },
    
    cedula: (cedula) => {
      return validators.isValidCedula(cedula);
    },

    fechaNacimiento: (fecha) => {
      return validators.isValidDate(fecha) && validators.isPastDate(fecha);
    }
  },

  // Validaciones para Préstamo
  prestamo: {
    montoTotal: (monto) => {
      return validators.isValidAmount(monto) && 
             validators.isPositiveNumber(parseFloat(monto)) &&
             parseFloat(monto) <= LIMITS.MONTO_MAX;
    },

    tasaInteres: (tasa) => {
      if (!tasa && tasa !== 0) return true;
      const tasaNum = parseFloat(tasa);
      return tasaNum >= 0 && tasaNum <= 100;
    },

    fechaVencimiento: (fecha) => {
      return validators.isValidDate(fecha) && validators.isFutureDate(fecha);
    },

    plazoDias: (plazo) => {
      if (!plazo) return true;
      return validators.isInteger(plazo) && plazo > 0;
    },

    cuotasPactadas: (cuotas) => {
      return validators.isInteger(cuotas) && cuotas >= 1;
    }
  },

  // Validaciones para Pago
  pago: {
    monto: (monto) => {
      return validators.isValidAmount(monto) && 
             validators.isPositiveNumber(parseFloat(monto)) &&
             parseFloat(monto) <= LIMITS.MONTO_MAX;
    },

    numeroTransaccion: (numero) => {
      if (!numero) return true;
      return validators.isValidLength(numero, 1, 50);
    },

    comprobanteUrl: (url) => {
      return validators.isValidUrl(url);
    },

    numeroCuota: (numero) => {
      if (!numero) return true;
      return validators.isInteger(numero) && numero >= 1;
    }
  }
};

// Función para validar un objeto completo
export const validateObject = (obj, validations) => {
  const errors = [];

  for (const [field, validator] of Object.entries(validations)) {
    const value = obj[field];
    
    try {
      if (!validator(value)) {
        errors.push({
          field,
          message: `El campo ${field} no es válido`,
          value
        });
      }
    } catch (error) {
      errors.push({
        field,
        message: `Error al validar ${field}: ${error.message}`,
        value
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validaciones para business logic
export const businessValidators = {
  // Validar que un pago no exceda la deuda restante
  validarMontoPago: (montoPago, montoRestante) => {
    const pago = parseFloat(montoPago);
    const restante = parseFloat(montoRestante);
    
    return pago <= restante;
  },

  // Validar que una persona no tenga demasiados préstamos activos
  validarLimitePrestamos: (prestamosActivos, limite = 5) => {
    return prestamosActivos < limite;
  },

  // Validar coherencia en fechas de préstamo
  validarFechasPrestamo: (fechaPrestamo, fechaVencimiento) => {
    if (!fechaVencimiento) return true;
    
    const prestamo = new Date(fechaPrestamo);
    const vencimiento = new Date(fechaVencimiento);
    
    return vencimiento > prestamo;
  },

  // Validar que los componentes del pago sumen correctamente
  validarComponentesPago: (monto, capital, interes, mora) => {
    const total = parseFloat(capital || 0) + parseFloat(interes || 0) + parseFloat(mora || 0);
    const montoTotal = parseFloat(monto);
    
    // Permitir una pequeña diferencia por redondeo
    return Math.abs(total - montoTotal) <= 0.01;
  }
};

// Sanitizadores
export const sanitizers = {
  // Limpiar string básico
  cleanString: (str) => {
    if (!str) return str;
    return str.toString().trim().replace(/\s+/g, ' ');
  },

  // Limpiar email
  cleanEmail: (email) => {
    if (!email) return email;
    return email.toString().toLowerCase().trim();
  },

  // Limpiar teléfono
  cleanPhone: (phone) => {
    if (!phone) return phone;
    return phone.toString().replace(/[^\d+\-\$\$\s]/g, '');
  },

  // Limpiar cédula
  cleanCedula: (cedula) => {
    if (!cedula) return cedula;
    return cedula.toString().replace(/\D/g, '');
  },

  // Limpiar monto decimal
  cleanAmount: (amount) => {
    if (!amount) return 0;
    const cleaned = parseFloat(amount);
    return isNaN(cleaned) ? 0 : Number(cleaned.toFixed(2));
  },

  // Limpiar texto largo
  cleanText: (text) => {
    if (!text) return text;
    return text.toString().trim().replace(/\s+/g, ' ').substring(0, 1000);
  }
};

export default {
  validators,
  modelValidators,
  validateObject,
  businessValidators,
  sanitizers
};