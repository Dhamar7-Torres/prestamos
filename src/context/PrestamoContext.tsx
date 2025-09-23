import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import apiService from '@/services/api';
import { useApp } from './AppContext';
import type { Prestamo, PrestamoFormData, PagoFormData, EstadisticasPrestamos } from '@/types';

// Definir filtros con tipos específicos
interface FiltrosPrestamo {
  completado?: boolean;
  personaId?: number;
  estado?: string;
  busqueda?: string;
}

// Estado inicial
interface PrestamoState {
  prestamos: Prestamo[];
  prestamoActual: Prestamo | null;
  estadisticas: EstadisticasPrestamos | null;
  filtros: FiltrosPrestamo;
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
  };
  ordenamiento: {
    campo: string;
    direccion: 'asc' | 'desc';
  };
  loading: boolean;
  error: string | null;
}

const initialState: PrestamoState = {
  prestamos: [],
  prestamoActual: null,
  estadisticas: null,
  filtros: {
    completado: undefined,
    personaId: undefined,
    estado: undefined,
    busqueda: ''
  },
  paginacion: {
    pagina: 1,
    limite: 10,
    total: 0
  },
  ordenamiento: {
    campo: 'createdAt',
    direccion: 'desc'
  },
  loading: false,
  error: null
};

// Action Types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_PRESTAMOS: 'SET_PRESTAMOS',
  ADD_PRESTAMO: 'ADD_PRESTAMO',
  UPDATE_PRESTAMO: 'UPDATE_PRESTAMO',
  REMOVE_PRESTAMO: 'REMOVE_PRESTAMO',
  SET_PRESTAMO_ACTUAL: 'SET_PRESTAMO_ACTUAL',
  CLEAR_PRESTAMO_ACTUAL: 'CLEAR_PRESTAMO_ACTUAL',
  SET_ESTADISTICAS: 'SET_ESTADISTICAS',
  SET_FILTROS: 'SET_FILTROS',
  CLEAR_FILTROS: 'CLEAR_FILTROS',
  SET_PAGINACION: 'SET_PAGINACION',
  SET_ORDENAMIENTO: 'SET_ORDENAMIENTO'
} as const;

type ActionType = typeof ActionTypes[keyof typeof ActionTypes];

interface PrestamoAction {
  type: ActionType;
  payload?: any;
}

// Reducer
const prestamoReducer = (state: PrestamoState, action: PrestamoAction): PrestamoState => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
      
    case ActionTypes.SET_PRESTAMOS:
      return { 
        ...state, 
        prestamos: action.payload.prestamos,
        paginacion: { 
          ...state.paginacion, 
          total: action.payload.total || action.payload.prestamos.length 
        }
      };
      
    case ActionTypes.ADD_PRESTAMO:
      return { 
        ...state, 
        prestamos: [action.payload, ...state.prestamos] 
      };
      
    case ActionTypes.UPDATE_PRESTAMO:
      return {
        ...state,
        prestamos: state.prestamos.map(prestamo =>
          prestamo.id === action.payload.id
            ? { ...prestamo, ...action.payload }
            : prestamo
        ),
        prestamoActual: state.prestamoActual?.id === action.payload.id
          ? { ...state.prestamoActual, ...action.payload }
          : state.prestamoActual
      };
      
    case ActionTypes.REMOVE_PRESTAMO:
      return {
        ...state,
        prestamos: state.prestamos.filter(prestamo => prestamo.id !== action.payload),
        prestamoActual: state.prestamoActual?.id === action.payload 
          ? null 
          : state.prestamoActual
      };
      
    case ActionTypes.SET_PRESTAMO_ACTUAL:
      return { ...state, prestamoActual: action.payload };
      
    case ActionTypes.CLEAR_PRESTAMO_ACTUAL:
      return { ...state, prestamoActual: null };
      
    case ActionTypes.SET_ESTADISTICAS:
      return { ...state, estadisticas: action.payload };
      
    case ActionTypes.SET_FILTROS:
      return { 
        ...state, 
        filtros: { ...state.filtros, ...action.payload },
        paginacion: { ...state.paginacion, pagina: 1 }
      };
      
    case ActionTypes.CLEAR_FILTROS:
      return { 
        ...state, 
        filtros: initialState.filtros,
        paginacion: { ...state.paginacion, pagina: 1 }
      };
      
    case ActionTypes.SET_PAGINACION:
      return { 
        ...state, 
        paginacion: { ...state.paginacion, ...action.payload } 
      };
      
    case ActionTypes.SET_ORDENAMIENTO:
      return { 
        ...state, 
        ordenamiento: action.payload,
        paginacion: { ...state.paginacion, pagina: 1 }
      };
      
    default:
      return state;
  }
};

// Actions interface
interface PrestamoActions {
  cargarPrestamos: (parametros?: Record<string, any>) => Promise<void>;
  cargarEstadisticas: () => Promise<void>;
  obtenerPrestamo: (id: number) => Promise<any>;
  crearPrestamo: (data: PrestamoFormData) => Promise<any>;
  actualizarPrestamo: (id: number, data: Partial<PrestamoFormData>) => Promise<any>;
  eliminarPrestamo: (id: number) => Promise<void>;
  registrarPago: (prestamoId: number, dataPago: Omit<PagoFormData, 'prestamoId'>) => Promise<any>;
  recalcularTotales: (id: number) => Promise<any>;
  setFiltros: (filtros: Partial<FiltrosPrestamo>) => void;
  clearFiltros: () => void;
  setPaginacion: (paginacion: Partial<PrestamoState['paginacion']>) => void;
  setOrdenamiento: (campo: string, direccion: 'asc' | 'desc') => void;
  clearError: () => void;
  clearPrestamoActual: () => void;
}

// Computed values interface
interface PrestamoComputed {
  prestamosPendientes: Prestamo[];
  prestamosCompletados: Prestamo[];
  totalPrestamos: number;
  totalPendientes: number;
  totalCompletados: number;
}

type PrestamoContextType = PrestamoState & PrestamoActions & PrestamoComputed;

// Context
const PrestamoContext = createContext<PrestamoContextType | null>(null);

// Provider Component
interface PrestamoProviderProps {
  children: ReactNode;
}

export const PrestamoProvider: React.FC<PrestamoProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(prestamoReducer, initialState);
  const { showSuccess, showError } = useApp();

  // Helper para manejar errores
  const handleError = useCallback((error: any, defaultMessage: string = 'Error inesperado') => {
    const message = error?.message || defaultMessage;
    dispatch({ type: ActionTypes.SET_ERROR, payload: message });
    showError(message);
  }, [showError]);

  // Actions
  const actions: PrestamoActions = {
    // Cargar préstamos
    cargarPrestamos: useCallback(async (parametros: Record<string, any> = {}) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        // Crear params sin usar indexing dinámico
        const params: Record<string, any> = {
          page: state.paginacion.pagina,
          limit: state.paginacion.limite,
          ordenarPor: state.ordenamiento.campo,
          orden: state.ordenamiento.direccion,
          ...parametros
        };

        // Agregar filtros específicos
        if (state.filtros.completado !== undefined) {
          params.completado = state.filtros.completado;
        }
        if (state.filtros.personaId) {
          params.personaId = state.filtros.personaId;
        }
        if (state.filtros.estado) {
          params.estado = state.filtros.estado;
        }
        if (state.filtros.busqueda) {
          params.busqueda = state.filtros.busqueda;
        }

        // Limpiar filtros vacíos
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === '' || params[key] === undefined) {
            delete params[key];
          }
        });

        const response = await apiService.obtenerPrestamos(params);
        
        dispatch({ 
          type: ActionTypes.SET_PRESTAMOS, 
          payload: {
            prestamos: response.data.data || [],
            total: response.data.pagination?.total || 0
          }
        });
      } catch (error) {
        handleError(error, 'Error al cargar préstamos');
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [state.paginacion, state.ordenamiento, state.filtros, handleError]),

    cargarEstadisticas: useCallback(async () => {
      try {
        const response = await apiService.obtenerEstadisticasPrestamos();
        dispatch({ type: ActionTypes.SET_ESTADISTICAS, payload: response.data });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    }, []),

    obtenerPrestamo: useCallback(async (id: number) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        const response = await apiService.obtenerPrestamo(id);
        dispatch({ type: ActionTypes.SET_PRESTAMO_ACTUAL, payload: response.data });
        return response.data;
      } catch (error) {
        handleError(error, 'Error al obtener préstamo');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [handleError]),

    crearPrestamo: useCallback(async (data: PrestamoFormData) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        const response = await apiService.crearPrestamo(data);
        dispatch({ type: ActionTypes.ADD_PRESTAMO, payload: response.data });
        showSuccess('Préstamo creado exitosamente');
        return response.data;
      } catch (error) {
        handleError(error, 'Error al crear préstamo');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [handleError, showSuccess]),

    actualizarPrestamo: useCallback(async (id: number, data: Partial<PrestamoFormData>) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        const response = await apiService.actualizarPrestamo(id, data);
        dispatch({ type: ActionTypes.UPDATE_PRESTAMO, payload: response.data });
        showSuccess('Préstamo actualizado exitosamente');
        return response.data;
      } catch (error) {
        handleError(error, 'Error al actualizar préstamo');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [handleError, showSuccess]),

    eliminarPrestamo: useCallback(async (id: number) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        await apiService.eliminarPrestamo(id);
        dispatch({ type: ActionTypes.REMOVE_PRESTAMO, payload: id });
        showSuccess('Préstamo eliminado exitosamente');
      } catch (error) {
        handleError(error, 'Error al eliminar préstamo');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [handleError, showSuccess]),

    registrarPago: useCallback(async (prestamoId: number, dataPago: Omit<PagoFormData, 'prestamoId'>) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        const pagoCompleto: PagoFormData = { 
          ...dataPago, 
          prestamoId 
        };

        const response = await apiService.crearPago(pagoCompleto);

        if (response.data.prestamo) {
          dispatch({ 
            type: ActionTypes.UPDATE_PRESTAMO, 
            payload: response.data.prestamo 
          });
        }

        showSuccess('Pago registrado exitosamente');
        return response.data;
      } catch (error) {
        handleError(error, 'Error al registrar pago');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [handleError, showSuccess]),

    recalcularTotales: useCallback(async (id: number) => {
      try {
        const response = await apiService.recalcularTotalesPrestamo(id);
        dispatch({ type: ActionTypes.UPDATE_PRESTAMO, payload: response.data });
        showSuccess('Totales recalculados exitosamente');
        return response.data;
      } catch (error) {
        handleError(error, 'Error al recalcular totales');
        throw error;
      }
    }, [handleError, showSuccess]),

    setFiltros: useCallback((filtros: Partial<FiltrosPrestamo>) => {
      dispatch({ type: ActionTypes.SET_FILTROS, payload: filtros });
    }, []),

    clearFiltros: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_FILTROS });
    }, []),

    setPaginacion: useCallback((paginacion: Partial<PrestamoState['paginacion']>) => {
      dispatch({ type: ActionTypes.SET_PAGINACION, payload: paginacion });
    }, []),

    setOrdenamiento: useCallback((campo: string, direccion: 'asc' | 'desc') => {
      dispatch({ 
        type: ActionTypes.SET_ORDENAMIENTO, 
        payload: { campo, direccion } 
      });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }, []),

    clearPrestamoActual: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_PRESTAMO_ACTUAL });
    }, [])
  };

  // Computed values
  const computed: PrestamoComputed = {
    prestamosPendientes: state.prestamos.filter(p => !p.completado),
    prestamosCompletados: state.prestamos.filter(p => p.completado),
    totalPrestamos: state.prestamos.length,
    totalPendientes: state.prestamos.filter(p => !p.completado).length,
    totalCompletados: state.prestamos.filter(p => p.completado).length
  };

  const value: PrestamoContextType = {
    ...state,
    ...actions,
    ...computed
  };

  return (
    <PrestamoContext.Provider value={value}>
      {children}
    </PrestamoContext.Provider>
  );
};

// Hook para usar el contexto
export const usePrestamo = (): PrestamoContextType => {
  const context = useContext(PrestamoContext);
  if (!context) {
    throw new Error('usePrestamo debe ser usado dentro de PrestamoProvider');
  }
  return context;
};

export default PrestamoContext;