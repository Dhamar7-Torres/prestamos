import { REGEX_PATTERNS, VALIDATION_RULES } from './constants';
import { parseDecimal } from './formatters';
import type { FieldValidationResult, ProcessedError, PaginationInfo } from '@/types';

// ====================================================
// VALIDACIONES
// ====================================================

export const validateEmail = (email?: string): FieldValidationResult => {
  if (!email) return { isValid: true, message: '' };
  
  if (!REGEX_PATTERNS.EMAIL.test(email)) {
    return { isValid: false, message: 'Email inválido' };
  }
  
  if (email.length > VALIDATION_RULES.EMAIL_MAX) {
    return { isValid: false, message: `Email demasiado largo (máx. ${VALIDATION_RULES.EMAIL_MAX} caracteres)` };
  }
  
  return { isValid: true, message: '' };
};

export const validatePhone = (phone?: string): FieldValidationResult => {
  if (!phone) return { isValid: true, message: '' };
  
  if (!REGEX_PATTERNS.PHONE.test(phone)) {
    return { isValid: false, message: 'Teléfono inválido' };
  }
  
  return { isValid: true, message: '' };
};

export const validateCedula = (cedula?: string): FieldValidationResult => {
  if (!cedula) return { isValid: true, message: '' };
  
  if (!REGEX_PATTERNS.CEDULA.test(cedula)) {
    return { isValid: false, message: 'Cédula inválida (6-12 dígitos)' };
  }
  
  return { isValid: true, message: '' };
};

export const validateName = (name?: string): FieldValidationResult => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Nombre requerido' };
  }
  
  if (name.trim().length < VALIDATION_RULES.NOMBRE_MIN) {
    return { isValid: false, message: `Nombre muy corto (mín. ${VALIDATION_RULES.NOMBRE_MIN} caracteres)` };
  }
  
  if (name.length > VALIDATION_RULES.NOMBRE_MAX) {
    return { isValid: false, message: `Nombre muy largo (máx. ${VALIDATION_RULES.NOMBRE_MAX} caracteres)` };
  }
  
  return { isValid: true, message: '' };
};

export const validateAmount = (amount: number | string): FieldValidationResult => {
  const numericAmount = parseDecimal(amount);
  
  if (numericAmount <= 0) {
    return { isValid: false, message: 'Monto debe ser mayor a cero' };
  }
  
  if (numericAmount > VALIDATION_RULES.MONTO_MAX) {
    return { isValid: false, message: 'Monto excede el límite permitido' };
  }
  
  return { isValid: true, message: '' };
};

export const validatePaymentAmount = (paymentAmount: number | string, remainingAmount: number | string): FieldValidationResult => {
  const payment = parseDecimal(paymentAmount);
  const remaining = parseDecimal(remainingAmount);
  
  if (payment <= 0) {
    return { isValid: false, message: 'Monto debe ser mayor a cero' };
  }
  
  if (payment > remaining) {
    return { isValid: false, message: 'El pago no puede exceder la deuda restante' };
  }
  
  return { isValid: true, message: '' };
};

// ====================================================
// UTILITARIOS GENERALES
// ====================================================

export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
  let inThrottle: boolean;
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    return false;
  }
};

export const downloadFile = (data: string, filename: string, type: string = 'application/json'): void => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const scrollToTop = (behavior: ScrollBehavior = 'smooth'): void => {
  window.scrollTo({ top: 0, behavior });
};

export const scrollToElement = (elementId: string, behavior: ScrollBehavior = 'smooth'): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior });
  }
};

// ====================================================
// MANEJO DE DATOS
// ====================================================

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups: Record<string, T[]>, item: T) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    
    return aVal > bVal ? 1 : -1;
  });
};

export const filterBy = <T>(array: T[], filters: Partial<Record<keyof T, any>>): T[] => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      const itemValue = item[key as keyof T];
      
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      
      return itemValue === value;
    });
  });
};

export const calculatePagination = (currentPage: number, totalItems: number, itemsPerPage: number): PaginationInfo => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};

// ====================================================
// MANEJO DE ERRORES
// ====================================================

export const handleApiError = (error: any): ProcessedError => {
  console.error('API Error:', error);
  
  if (!error.response) {
    return {
      message: 'Error de conexión. Verifica tu internet.',
      type: 'network'
    };
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      return {
        message: data.message || 'Datos inválidos',
        type: 'validation',
        details: data.details
      };
    case 401:
      return {
        message: 'No autorizado',
        type: 'auth'
      };
    case 403:
      return {
        message: 'Sin permisos para esta acción',
        type: 'permission'
      };
    case 404:
      return {
        message: 'Recurso no encontrado',
        type: 'notfound'
      };
    case 429:
      return {
        message: 'Demasiadas solicitudes. Intenta más tarde.',
        type: 'ratelimit'
      };
    case 500:
      return {
        message: 'Error del servidor. Intenta más tarde.',
        type: 'server'
      };
    default:
      return {
        message: data.message || 'Error inesperado',
        type: 'unknown'
      };
  }
};

// ====================================================
// CÁLCULOS FINANCIEROS
// ====================================================

export const calculateProgress = (paid: number | string, total: number | string): number => {
  const paidNum = Number(paid);
  const totalNum = Number(total);
  
  if (!totalNum || totalNum <= 0) return 0;
  
  const progress = (paidNum / totalNum) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

export const calculateDaysUntilDue = (dueDate?: string): number | null => {
  if (!dueDate) return null;
  
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const isOverdue = (dueDate?: string, isCompleted: boolean = false): boolean => {
  if (isCompleted || !dueDate) return false;
  
  const today = new Date();
  const due = new Date(dueDate);
  
  return due < today;
};

export const calculateInterest = (principal: number, rate: number, days: number): number => {
  if (!rate || rate <= 0) return 0;
  
  const dailyRate = rate / 100 / 365;
  return principal * dailyRate * days;
};

interface PaymentSuggestion {
  label: string;
  amount: number;
}

export const suggestPaymentAmounts = (remainingAmount: number | string): PaymentSuggestion[] => {
  const remaining = parseDecimal(remainingAmount);
  
  return [
    { label: '25%', amount: remaining * 0.25 },
    { label: '50%', amount: remaining * 0.5 },
    { label: '75%', amount: remaining * 0.75 },
    { label: 'Todo', amount: remaining }
  ].filter(suggestion => suggestion.amount > 0);
};

// ====================================================
// UTILIDADES DE UI
// ====================================================

export const getStatusColor = (status: string, type: 'text' | 'bg' = 'text'): string => {
  const colors: Record<string, string> = {
    success: type === 'bg' ? 'bg-success-100' : 'text-success-600',
    warning: type === 'bg' ? 'bg-warning-100' : 'text-warning-600',
    danger: type === 'bg' ? 'bg-danger-100' : 'text-danger-600',
    info: type === 'bg' ? 'bg-primary-100' : 'text-primary-600',
    gray: type === 'bg' ? 'bg-gray-100' : 'text-gray-600'
  };
  
  return colors[status] || colors.gray;
};

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};