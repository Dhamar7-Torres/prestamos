import { REGEX_PATTERNS, VALIDATION_RULES } from './constants';
import type { ValidationResult, FieldValidationResult, PersonaFormData, PrestamoFormData, PagoFormData, Prestamo } from '@/types';

// ====================================================
// VALIDADORES BÁSICOS
// ====================================================

export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
};

export const isEmail = (email?: string): boolean => {
  if (!email) return false;
  return REGEX_PATTERNS.EMAIL.test(email);
};

export const isPhone = (phone?: string): boolean => {
  if (!phone) return false;
  return REGEX_PATTERNS.PHONE.test(phone);
};

export const isCedula = (cedula?: string): boolean => {
  if (!cedula) return false;
  const cleanCedula = cedula.toString().replace(/\D/g, '');
  return REGEX_PATTERNS.CEDULA.test(cleanCedula);
};

export const isNumber = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const isPositiveNumber = (value: any): boolean => {
  return isNumber(value) && parseFloat(value) > 0;
};

export const isInteger = (value: any): boolean => {
  return Number.isInteger(Number(value));
};

export const isDecimal = (value: any): boolean => {
  return REGEX_PATTERNS.DECIMAL.test(value.toString());
};

export const isUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isDate = (date?: string | Date): boolean => {
  if (!date) return false;
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

export const isFutureDate = (date?: string | Date): boolean => {
  if (!isDate(date)) return false;
  return new Date(date!) > new Date();
};

export const isPastDate = (date?: string | Date): boolean => {
  if (!isDate(date)) return false;
  return new Date(date!) < new Date();
};

// ====================================================
// VALIDADORES DE LONGITUD
// ====================================================

export const minLength = (value: any, min: number): boolean => {
  if (!value) return false;
  return value.toString().length >= min;
};

export const maxLength = (value: any, max: number): boolean => {
  if (!value) return true;
  return value.toString().length <= max;
};

export const lengthBetween = (value: any, min: number, max: number): boolean => {
  return minLength(value, min) && maxLength(value, max);
};

// ====================================================
// VALIDADORES DE RANGO
// ====================================================

export const minValue = (value: any, min: number): boolean => {
  return isNumber(value) && parseFloat(value) >= min;
};

export const maxValue = (value: any, max: number): boolean => {
  return isNumber(value) && parseFloat(value) <= max;
};

export const valueBetween = (value: any, min: number, max: number): boolean => {
  return minValue(value, min) && maxValue(value, max);
};

// ====================================================
// VALIDADORES ESPECÍFICOS DEL DOMINIO
// ====================================================

export const validatePersona = (persona: PersonaFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Nombre (requerido)
  if (!isRequired(persona.nombre)) {
    errors.nombre = 'El nombre es requerido';
  } else if (!lengthBetween(persona.nombre, VALIDATION_RULES.NOMBRE_MIN, VALIDATION_RULES.NOMBRE_MAX)) {
    errors.nombre = `El nombre debe tener entre ${VALIDATION_RULES.NOMBRE_MIN} y ${VALIDATION_RULES.NOMBRE_MAX} caracteres`;
  }

  // Apellido (opcional)
  if (persona.apellido && !maxLength(persona.apellido, VALIDATION_RULES.NOMBRE_MAX)) {
    errors.apellido = `El apellido no puede exceder ${VALIDATION_RULES.NOMBRE_MAX} caracteres`;
  }

  // Email (opcional)
  if (persona.email) {
    if (!isEmail(persona.email)) {
      errors.email = 'Email inválido';
    } else if (!maxLength(persona.email, VALIDATION_RULES.EMAIL_MAX)) {
      errors.email = `El email no puede exceder ${VALIDATION_RULES.EMAIL_MAX} caracteres`;
    }
  }

  // Teléfono (opcional)
  if (persona.telefono) {
    if (!isPhone(persona.telefono)) {
      errors.telefono = 'Teléfono inválido';
    } else if (!maxLength(persona.telefono, VALIDATION_RULES.TELEFONO_MAX)) {
      errors.telefono = `El teléfono no puede exceder ${VALIDATION_RULES.TELEFONO_MAX} caracteres`;
    }
  }

  // Cédula (opcional)
  if (persona.cedula && !isCedula(persona.cedula)) {
    errors.cedula = 'Cédula inválida (debe tener entre 6 y 12 dígitos)';
  }

  // Fecha de nacimiento (opcional)
  if (persona.fechaNacimiento) {
    if (!isDate(persona.fechaNacimiento)) {
      errors.fechaNacimiento = 'Fecha inválida';
    } else if (!isPastDate(persona.fechaNacimiento)) {
      errors.fechaNacimiento = 'La fecha de nacimiento debe ser pasada';
    }
  }

  // Notas (opcional)
  if (persona.notas && !maxLength(persona.notas, VALIDATION_RULES.DESCRIPCION_MAX)) {
    errors.notas = `Las notas no pueden exceder ${VALIDATION_RULES.DESCRIPCION_MAX} caracteres`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePrestamo = (prestamo: PrestamoFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Persona ID (requerido)
  if (!isRequired(prestamo.personaId)) {
    errors.personaId = 'Debe seleccionar una persona';
  } else if (!isPositiveNumber(prestamo.personaId)) {
    errors.personaId = 'ID de persona inválido';
  }

  // Monto total (requerido)
  if (!isRequired(prestamo.montoTotal)) {
    errors.montoTotal = 'El monto total es requerido';
  } else if (!isPositiveNumber(prestamo.montoTotal)) {
    errors.montoTotal = 'El monto debe ser mayor a cero';
  } else if (!valueBetween(prestamo.montoTotal, VALIDATION_RULES.MONTO_MIN, VALIDATION_RULES.MONTO_MAX)) {
    errors.montoTotal = `El monto debe estar entre ${VALIDATION_RULES.MONTO_MIN} y ${VALIDATION_RULES.MONTO_MAX}`;
  } else if (!isDecimal(prestamo.montoTotal)) {
    errors.montoTotal = 'El monto debe tener máximo 2 decimales';
  }

  // Tasa de interés (opcional)
  if (prestamo.tasaInteres !== undefined && prestamo.tasaInteres !== null) {
    if (!isNumber(prestamo.tasaInteres)) {
      errors.tasaInteres = 'La tasa de interés debe ser un número';
    } else if (!valueBetween(prestamo.tasaInteres, 0, 100)) {
      errors.tasaInteres = 'La tasa de interés debe estar entre 0% y 100%';
    } else if (!isDecimal(prestamo.tasaInteres)) {
      errors.tasaInteres = 'La tasa de interés debe tener máximo 2 decimales';
    }
  }

  // Fecha de vencimiento (opcional)
  if (prestamo.fechaVencimiento) {
    if (!isDate(prestamo.fechaVencimiento)) {
      errors.fechaVencimiento = 'Fecha de vencimiento inválida';
    } else if (!isFutureDate(prestamo.fechaVencimiento)) {
      errors.fechaVencimiento = 'La fecha de vencimiento debe ser futura';
    }
  }

  // Plazo en días (opcional)
  if (prestamo.plazoDias !== undefined && prestamo.plazoDias !== null) {
    if (!isInteger(prestamo.plazoDias)) {
      errors.plazoDias = 'El plazo debe ser un número entero';
    } else if (!isPositiveNumber(prestamo.plazoDias)) {
      errors.plazoDias = 'El plazo debe ser mayor a cero';
    }
  }

  // Cuotas pactadas (opcional)
  if (prestamo.cuotasPactadas !== undefined && prestamo.cuotasPactadas !== null) {
    if (!isInteger(prestamo.cuotasPactadas)) {
      errors.cuotasPactadas = 'Las cuotas deben ser un número entero';
    } else if (!isPositiveNumber(prestamo.cuotasPactadas)) {
      errors.cuotasPactadas = 'Las cuotas deben ser mayor a cero';
    }
  }

  // Descripción (opcional)
  if (prestamo.descripcion && !maxLength(prestamo.descripcion, VALIDATION_RULES.DESCRIPCION_MAX)) {
    errors.descripcion = `La descripción no puede exceder ${VALIDATION_RULES.DESCRIPCION_MAX} caracteres`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePago = (pago: PagoFormData, prestamoInfo?: Prestamo | null): ValidationResult => {
  const errors: Record<string, string> = {};

  // Préstamo ID (requerido)
  if (!isRequired(pago.prestamoId)) {
    errors.prestamoId = 'ID de préstamo requerido';
  } else if (!isPositiveNumber(pago.prestamoId)) {
    errors.prestamoId = 'ID de préstamo inválido';
  }

  // Monto (requerido)
  if (!isRequired(pago.monto)) {
    errors.monto = 'El monto es requerido';
  } else if (!isPositiveNumber(pago.monto)) {
    errors.monto = 'El monto debe ser mayor a cero';
  } else if (!valueBetween(pago.monto, VALIDATION_RULES.MONTO_MIN, VALIDATION_RULES.MONTO_MAX)) {
    errors.monto = `El monto debe estar entre ${VALIDATION_RULES.MONTO_MIN} y ${VALIDATION_RULES.MONTO_MAX}`;
  } else if (!isDecimal(pago.monto)) {
    errors.monto = 'El monto debe tener máximo 2 decimales';
  }

  // Validar que el pago no exceda la deuda restante
  if (prestamoInfo && prestamoInfo.montoRestante && isPositiveNumber(pago.monto)) {
    if (parseFloat(String(pago.monto)) > parseFloat(String(prestamoInfo.montoRestante))) {
      errors.monto = 'El pago no puede exceder la deuda restante';
    }
  }

  // Monto capital (opcional)
  if (pago.montoCapital !== undefined && pago.montoCapital !== null) {
    if (!isNumber(pago.montoCapital) || parseFloat(String(pago.montoCapital)) < 0) {
      errors.montoCapital = 'El monto de capital debe ser mayor o igual a cero';
    } else if (!isDecimal(pago.montoCapital)) {
      errors.montoCapital = 'El monto de capital debe tener máximo 2 decimales';
    }
  }

  // Monto interés (opcional)
  if (pago.montoInteres !== undefined && pago.montoInteres !== null) {
    if (!isNumber(pago.montoInteres) || parseFloat(String(pago.montoInteres)) < 0) {
      errors.montoInteres = 'El monto de interés debe ser mayor o igual a cero';
    } else if (!isDecimal(pago.montoInteres)) {
      errors.montoInteres = 'El monto de interés debe tener máximo 2 decimales';
    }
  }

  // Monto mora (opcional)
  if (pago.montoMora !== undefined && pago.montoMora !== null) {
    if (!isNumber(pago.montoMora) || parseFloat(String(pago.montoMora)) < 0) {
      errors.montoMora = 'El monto de mora debe ser mayor o igual a cero';
    } else if (!isDecimal(pago.montoMora)) {
      errors.montoMora = 'El monto de mora debe tener máximo 2 decimales';
    }
  }

  // Validar que la suma de componentes coincida con el monto total
  const capital = parseFloat(String(pago.montoCapital || 0));
  const interes = parseFloat(String(pago.montoInteres || 0));
  const mora = parseFloat(String(pago.montoMora || 0));
  const sumaComponentes = capital + interes + mora;
  const montoTotal = parseFloat(String(pago.monto || 0));

  if (sumaComponentes > 0 && Math.abs(sumaComponentes - montoTotal) > 0.01) {
    errors.componentes = 'La suma de capital, interés y mora debe coincidir con el monto total';
  }

  // Método de pago (opcional con validación)
  const metodosValidos = ['efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro'];
  if (pago.metodoPago && !metodosValidos.includes(pago.metodoPago)) {
    errors.metodoPago = 'Método de pago inválido';
  }

  // Número de transacción (opcional)
  if (pago.numeroTransaccion && !maxLength(pago.numeroTransaccion, 50)) {
    errors.numeroTransaccion = 'El número de transacción no puede exceder 50 caracteres';
  }

  // Fecha programada (opcional)
  if (pago.fechaProgramada) {
    if (!isDate(pago.fechaProgramada)) {
      errors.fechaProgramada = 'Fecha programada inválida';
    }
  }

  // Número de cuota (opcional)
  if (pago.numeroCuota !== undefined && pago.numeroCuota !== null) {
    if (!isInteger(pago.numeroCuota)) {
      errors.numeroCuota = 'El número de cuota debe ser un número entero';
    } else if (!isPositiveNumber(pago.numeroCuota)) {
      errors.numeroCuota = 'El número de cuota debe ser mayor a cero';
    }
  }

  // Descripción (opcional)
  if (pago.descripcion && !maxLength(pago.descripcion, VALIDATION_RULES.DESCRIPCION_MAX)) {
    errors.descripcion = `La descripción no puede exceder ${VALIDATION_RULES.DESCRIPCION_MAX} caracteres`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ====================================================
// VALIDADORES DE FORMULARIOS
// ====================================================

interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export const validateForm = (
  formData: Record<string, any>, 
  validationRules: Record<string, ValidationRule[]>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];

    rules.forEach(rule => {
      if (!errors[field]) { // Solo si no hay error previo
        if (!rule.validator(value)) {
          errors[field] = rule.message;
        }
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ====================================================
// VALIDADORES COMPUESTOS
// ====================================================

type ValidatorFunction = (value: any) => boolean | string;

export const createValidator = (rules: (ValidatorFunction | ValidationRule)[]): ValidatorFunction => {
  return (value: any): boolean | string => {
    for (const rule of rules) {
      if (typeof rule === 'function') {
        const result = rule(value);
        if (result !== true) {
          return result;
        }
      } else {
        const result = rule.validator(value);
        if (result !== true) {
          return rule.message;
        }
      }
    }
    return true;
  };
};

// Validadores predefinidos comunes
export const validators = {
  required: (message: string = 'Este campo es requerido'): ValidationRule => ({
    validator: isRequired,
    message
  }),
  
  email: (message: string = 'Email inválido'): ValidationRule => ({
    validator: isEmail,
    message
  }),
  
  phone: (message: string = 'Teléfono inválido'): ValidationRule => ({
    validator: isPhone,
    message
  }),
  
  positiveAmount: (message: string = 'Debe ser un monto válido mayor a cero'): ValidationRule => ({
    validator: isPositiveNumber,
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    validator: (value: any) => minLength(value, min),
    message: message || `Mínimo ${min} caracteres`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    validator: (value: any) => maxLength(value, max),
    message: message || `Máximo ${max} caracteres`
  })
};

export default {
  // Validadores básicos
  isRequired,
  isEmail,
  isPhone,
  isCedula,
  isNumber,
  isPositiveNumber,
  isInteger,
  isDecimal,
  isUrl,
  isDate,
  isFutureDate,
  isPastDate,
  
  // Validadores de longitud
  minLength,
  maxLength,
  lengthBetween,
  
  // Validadores de rango
  minValue,
  maxValue,
  valueBetween,
  
  // Validadores del dominio
  validatePersona,
  validatePrestamo,
  validatePago,
  
  // Utilidades
  validateForm,
  createValidator,
  validators
};