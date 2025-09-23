import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { CURRENCY_CONFIG, DATE_FORMATS } from './constants';

// ====================================================
// FORMATEO DE MONEDA
// ====================================================

interface CurrencyOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export const formatCurrency = (amount: number | string | null | undefined, options: CurrencyOptions = {}): string => {
  const {
    locale = CURRENCY_CONFIG.LOCALE,
    currency = CURRENCY_CONFIG.CURRENCY,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${CURRENCY_CONFIG.SYMBOL}0`;
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(numericAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${CURRENCY_CONFIG.SYMBOL}${numericAmount.toFixed(2)}`;
  }
};

interface NumberOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export const formatNumber = (number: number | string | null | undefined, options: NumberOptions = {}): string => {
  const {
    locale = CURRENCY_CONFIG.LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  if (number === null || number === undefined || isNaN(Number(number))) {
    return '0';
  }

  const numericValue = typeof number === 'string' ? parseFloat(number) : Number(number);

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(numericValue);
  } catch (error) {
    console.error('Error formatting number:', error);
    return numericValue.toFixed(maximumFractionDigits);
  }
};

export const formatPercentage = (value: number, total: number, decimals: number = 1): string => {
  if (!total || total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

// ====================================================
// FORMATEO DE FECHAS
// ====================================================

export const formatDate = (date: string | Date | null | undefined, formatStr: string = DATE_FORMATS.DISPLAY): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Fecha inválida';
    }

    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error de fecha';
  }
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

export const formatTimeAgo = (date: string | Date | null | undefined): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Fecha inválida';
    }

    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: es 
    });
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'Error de fecha';
  }
};

export const formatDateForAPI = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.API);
};

// ====================================================
// FORMATEO DE TEXTO
// ====================================================

export const formatName = (nombre: string, apellido?: string): string => {
  if (!nombre) return '-';
  
  const nombreFormateado = nombre.trim();
  const apellidoFormateado = apellido ? apellido.trim() : '';
  
  return apellidoFormateado 
    ? `${nombreFormateado} ${apellidoFormateado}`
    : nombreFormateado;
};

export const formatPhone = (phone?: string): string => {
  if (!phone) return '-';
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+57')) {
    const number = cleaned.substring(3);
    if (number.length === 10) {
      return `+57 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
  } else if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
};

export const formatCedula = (cedula?: string): string => {
  if (!cedula) return '-';
  
  const cleaned = cedula.replace(/\D/g, '');
  
  if (cleaned.length > 3) {
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  return cleaned;
};

export const truncateText = (text?: string, maxLength: number = 50): string => {
  if (!text) return '-';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

export const capitalize = (text?: string): string => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text?: string): string => {
  if (!text) return '';
  
  return text.replace(/\w\S*/g, (word) => 
    word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
  );
};

// ====================================================
// FORMATEO DE ESTADOS Y ETIQUETAS
// ====================================================

interface StatusStyle {
  text: string;
  color: string;
  bg: string;
}

export const formatEstadoPrestamo = (estado: string): StatusStyle => {
  const estados: Record<string, StatusStyle> = {
    activo: { text: 'Activo', color: 'text-warning-600', bg: 'bg-warning-100' },
    completado: { text: 'Completado', color: 'text-success-600', bg: 'bg-success-100' },
    cancelado: { text: 'Cancelado', color: 'text-gray-600', bg: 'bg-gray-100' },
    vencido: { text: 'Vencido', color: 'text-danger-600', bg: 'bg-danger-100' }
  };

  return estados[estado] || { text: estado, color: 'text-gray-600', bg: 'bg-gray-100' };
};

export const formatMetodoPago = (metodo: string): string => {
  const metodos: Record<string, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    tarjeta: 'Tarjeta',
    cheque: 'Cheque',
    otro: 'Otro'
  };

  return metodos[metodo] || metodo;
};

export const formatTipoPrestamo = (tipo: string): string => {
  const tipos: Record<string, string> = {
    personal: 'Personal',
    comercial: 'Comercial',
    emergencia: 'Emergencia',
    otro: 'Otro'
  };

  return tipos[tipo] || tipo;
};

// ====================================================
// UTILITARIOS DE FORMATEO
// ====================================================

export const parseDecimal = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const parsed = typeof value === 'string' 
    ? parseFloat(value.replace(/[^\d.-]/g, '')) 
    : parseFloat(String(value));
    
  return isNaN(parsed) ? 0 : Number(parsed.toFixed(2));
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const formatDuration = (minutes?: number): string => {
  if (!minutes || minutes < 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  
  return `${mins}min`;
};