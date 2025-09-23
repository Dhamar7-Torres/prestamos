// ====================================================
// TIPOS BASE
// ====================================================

export interface Personas {
  id: number;
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  prestamos?: Prestamo[];
  _count?: {
    prestamos: number;
  };
}

export interface Prestamo {
  id: number;
  personaId: number;
  montoTotal: number;
  montoPagado: number;
  montoRestante: number;
  tasaInteres: number;
  tipoPrestamo: TipoPrestamo;
  estado: EstadoPrestamo;
  descripcion?: string;
  fechaPrestamo: string;
  fechaVencimiento?: string;
  fechaCompletado?: string;
  completado: boolean;
  plazoDias?: number;
  cuotasPactadas: number;
  cuotasPagadas: number;
  interesGenerado: number;
  moraAcumulada: number;
  createdAt: string;
  updatedAt: string;
  persona?: Persona;
  pagos?: Pago[];
  recordatorios?: Recordatorio[];
  _count?: {
    pagos: number;
  };
}

export interface Pago {
  id: number;
  prestamoId: number;
  monto: number;
  montoCapital: number;
  montoInteres: number;
  montoMora: number;
  metodoPago: MetodoPago;
  numeroTransaccion?: string;
  descripcion?: string;
  comprobanteUrl?: string;
  fechaPago: string;
  fechaProgramada?: string;
  esCuota: boolean;
  numeroCuota?: number;
  createdAt: string;
  createdBy: string;
  prestamo?: Prestamo;
}

export interface Recordatorio {
  id: number;
  prestamoId: number;
  titulo: string;
  descripcion?: string;
  fechaRecordatorio: string;
  enviado: boolean;
  fechaEnvio?: string;
  tipoRecordatorio: string;
  activo: boolean;
  createdAt: string;
  prestamo?: Prestamo;
}

// ====================================================
// ENUMS
// ====================================================

export type TipoPrestamo = 'personal' | 'comercial' | 'emergencia' | 'otro';
export type EstadoPrestamo = 'activo' | 'completado' | 'cancelado' | 'vencido';
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque' | 'otro';

// ====================================================
// TIPOS DE API
// ====================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  details?: any;
  timestamp: string;
}

// ====================================================
// TIPOS DE FORMULARIO
// ====================================================

export interface PersonaFormData {
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

export interface PrestamoFormData {
  personaId: number;
  montoTotal: number;
  tasaInteres?: number;
  tipoPrestamo?: TipoPrestamo;
  descripcion?: string;
  fechaVencimiento?: string;
  fechaPrestamo?: string;
  plazoDias?: number;
  cuotasPactadas?: number;
}

export interface PagoFormData {
  prestamoId: number;
  monto: number;
  montoCapital?: number;
  montoInteres?: number;
  montoMora?: number;
  metodoPago?: MetodoPago;
  numeroTransaccion?: string;
  descripcion?: string;
  comprobanteUrl?: string;
  fechaProgramada?: string;
  esCuota?: boolean;
  numeroCuota?: number;
}

// En tu archivo de types
interface Persona {
  id: number;
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  cedula?: string;
  direccion?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    prestamos: number;
  };
}

// ====================================================
// TIPOS DE ESTADÍSTICAS
// ====================================================

export interface EstadisticasPrestamos {
  totales: {
    montoTotal: number;
    montoPagado: number;
    montoRestante: number;
    cantidad: number;
  };
  estados: {
    activos: number;
    completados: number;
    vencidos: number;
  };
}

export interface EstadisticasPagos {
  metodo: MetodoPago;
  totalMonto: number;
  cantidadPagos: number;
}

// ====================================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ====================================================

export interface FiltrosPrestamos {
  completado?: boolean;
  personaId?: number;
  estado?: EstadoPrestamo;
  busqueda?: string;
  ordenarPor?: string;
  orden?: 'asc' | 'desc';
}

// Y agregar esta interface al final:
export interface FiltrosPrestamos {
  completado?: boolean;
  personaId?: number;
  estado?: EstadoPrestamo; 
  busqueda?: string;
  ordenarPor?: string;
  orden?: 'asc' | 'desc';
}

export interface FiltrosPersonas {
  buscar?: string;
  incluirInactivas?: boolean;
}

// ====================================================
// TIPOS DE VALIDACIÓN
// ====================================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidationResult {
  isValid: boolean;
  message: string;
}

// ====================================================
// TIPOS DE CONTEXTO
// ====================================================

export interface NotificationData {
  id?: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  autoRemove?: boolean;
  timestamp?: string;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: string;
  permissions: string[];
}

// ====================================================
// TIPOS DE HOOKS
// ====================================================

export interface UseApiOptions {
  showLoader?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  resetErrorOnStart?: boolean;
}

export interface UsePrestamosOptions {
  autoLoad?: boolean;
  filtros?: FiltrosPrestamos;
  ordenarPor?: string;
  orden?: 'asc' | 'desc';
}

export interface UsePagosOptions {
  autoLoad?: boolean;
  prestamoId?: number;
  personaId?: number;
  limit?: number;
}

// ====================================================
// TIPOS DE UTILIDADES
// ====================================================

export interface PaginationInfo {
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrev: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface ProcessedError {
  message: string;
  type: 'network' | 'validation' | 'auth' | 'permission' | 'notfound' | 'ratelimit' | 'server' | 'unknown';
  details?: any;
}