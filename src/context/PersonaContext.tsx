import React, { createContext, useContext, useReducer, useCallback, ReactNode, useRef } from 'react';
import apiService from '@/services/api';
import { useApp } from './AppContext';
import type { Persona, PersonaFormData } from '@/types';

// Definir filtros con tipos específicos
interface FiltrosPersona {
  busqueda?: string;
  conPrestamos?: boolean;
}

// Estado inicial
interface PersonaState {
  personas: Persona[];
  personaActual: Persona | null;
  filtros: FiltrosPersona;
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

const initialState: PersonaState = {
  personas: [],
  personaActual: null,
  filtros: {
    busqueda: '',
    conPrestamos: undefined
  },
  paginacion: {
    pagina: 1,
    limite: 20,
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
  SET_PERSONAS: 'SET_PERSONAS',
  ADD_PERSONA: 'ADD_PERSONA',
  UPDATE_PERSONA: 'UPDATE_PERSONA',
  REMOVE_PERSONA: 'REMOVE_PERSONA',
  SET_PERSONA_ACTUAL: 'SET_PERSONA_ACTUAL',
  CLEAR_PERSONA_ACTUAL: 'CLEAR_PERSONA_ACTUAL',
  SET_FILTROS: 'SET_FILTROS',
  CLEAR_FILTROS: 'CLEAR_FILTROS',
  SET_PAGINACION: 'SET_PAGINACION',
  SET_ORDENAMIENTO: 'SET_ORDENAMIENTO'
} as const;

type ActionType = typeof ActionTypes[keyof typeof ActionTypes];

interface PersonaAction {
  type: ActionType;
  payload?: any;
}

// Reducer
const personaReducer = (state: PersonaState, action: PersonaAction): PersonaState => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
      
    case ActionTypes.SET_PERSONAS:
      return { 
        ...state, 
        personas: action.payload.personas,
        paginacion: { 
          ...state.paginacion, 
          total: action.payload.total || action.payload.personas.length 
        }
      };
      
    case ActionTypes.ADD_PERSONA:
      return { 
        ...state, 
        personas: [action.payload, ...state.personas] 
      };
      
    case ActionTypes.UPDATE_PERSONA:
      return {
        ...state,
        personas: state.personas.map(persona =>
          persona.id === action.payload.id
            ? { ...persona, ...action.payload }
            : persona
        ),
        personaActual: state.personaActual?.id === action.payload.id
          ? { ...state.personaActual, ...action.payload }
          : state.personaActual
      };
      
    case ActionTypes.REMOVE_PERSONA:
      return {
        ...state,
        personas: state.personas.filter(persona => persona.id !== action.payload),
        personaActual: state.personaActual?.id === action.payload 
          ? null 
          : state.personaActual
      };
      
    case ActionTypes.SET_PERSONA_ACTUAL:
      return { ...state, personaActual: action.payload };
      
    case ActionTypes.CLEAR_PERSONA_ACTUAL:
      return { ...state, personaActual: null };
      
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
interface PersonaActions {
  cargarPersonas: (parametros?: Record<string, any>) => Promise<void>;
  obtenerPersona: (id: number) => Promise<any>;
  crearPersona: (data: PersonaFormData) => Promise<any>;
  actualizarPersona: (id: number, data: Partial<PersonaFormData>) => Promise<any>;
  eliminarPersona: (id: number) => Promise<void>;
  setFiltros: (filtros: Partial<FiltrosPersona>) => void;
  clearFiltros: () => void;
  setPaginacion: (paginacion: Partial<PersonaState['paginacion']>) => void;
  setOrdenamiento: (campo: string, direccion: 'asc' | 'desc') => void;
  clearError: () => void;
  clearPersonaActual: () => void;
}

// Computed values interface
interface PersonaComputed {
  totalPersonas: number;
  personasConPrestamos: Persona[];
  personasSinPrestamos: Persona[];
}

type PersonaContextType = PersonaState & PersonaActions & PersonaComputed;

// Context
const PersonaContext = createContext<PersonaContextType | null>(null);

// Provider Component
interface PersonaProviderProps {
  children: ReactNode;
}

export const PersonaProvider: React.FC<PersonaProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(personaReducer, initialState);
  const { showSuccess, showError } = useApp();
  
  // ✅ SOLUCIÓN: Usar refs para evitar dependencias cambiantes
  const loadingRef = useRef(false);
  const lastParamsRef = useRef<string>('');

  // Helper para manejar errores
  const handleError = useCallback((error: any, defaultMessage: string = 'Error inesperado') => {
    const message = error?.message || defaultMessage;
    dispatch({ type: ActionTypes.SET_ERROR, payload: message });
    showError(message);
  }, [showError]);

  // ✅ OPTIMIZACIÓN PRINCIPAL: Función sin dependencias del state
  const cargarPersonas = useCallback(async (parametros: Record<string, any> = {}) => {
    // Prevenir llamadas concurrentes
    if (loadingRef.current) {
      console.log('🚫 Llamada a cargarPersonas bloqueada - ya está cargando');
      return;
    }

    // Crear parámetros con valores actuales del state
    const currentState = state;
    const pageParam = Math.max(1, parseInt(String(parametros.page || currentState.paginacion.pagina || 1)) || 1);
    const limitParam = Math.max(1, Math.min(parseInt(String(parametros.limit || currentState.paginacion.limite || 20)) || 20, 100));
    
    const params: Record<string, any> = {
      page: pageParam,
      limit: limitParam,
      ordenarPor: parametros.ordenarPor || currentState.ordenamiento.campo || 'createdAt',
      orden: parametros.orden || currentState.ordenamiento.direccion || 'desc'
    };

    // Agregar filtros solo si tienen valores válidos
    if (currentState.filtros.busqueda && currentState.filtros.busqueda.trim()) {
      params.busqueda = currentState.filtros.busqueda.trim();
    }
    if (currentState.filtros.conPrestamos !== undefined) {
      params.conPrestamos = currentState.filtros.conPrestamos;
    }

    // Agregar parámetros adicionales validados
    Object.keys(parametros).forEach(key => {
      if (key !== 'page' && key !== 'limit' && key !== 'ordenarPor' && key !== 'orden') {
        const valor = parametros[key];
        if (valor !== null && valor !== undefined && valor !== '') {
          params[key] = valor;
        }
      }
    });

    // ✅ CACHE: Evitar llamadas duplicadas con los mismos parámetros
    const paramsString = JSON.stringify(params);
    if (lastParamsRef.current === paramsString) {
      console.log('🚫 Llamada duplicada evitada:', params);
      return;
    }

    loadingRef.current = true;
    lastParamsRef.current = paramsString;
    
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      console.log('✅ Cargando personas con parámetros:', params);
      const response = await apiService.obtenerPersonas(params);
      
      dispatch({ 
        type: ActionTypes.SET_PERSONAS, 
        payload: {
          personas: response.data.data || [],
          total: response.data.pagination?.total || 0
        }
      });
    } catch (error) {
      console.error('❌ Error en cargarPersonas:', error);
      handleError(error, 'Error al cargar personas');
      // Resetear cache en caso de error
      lastParamsRef.current = '';
    } finally {
      loadingRef.current = false;
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [handleError]); // ✅ SOLO handleError como dependencia

  // Actions
  const actions: PersonaActions = {
    cargarPersonas,

    obtenerPersona: useCallback(async (id: number) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        const response = await apiService.obtenerPersona(id);
        dispatch({ type: ActionTypes.SET_PERSONA_ACTUAL, payload: response.data });
        return response.data;
      } catch (error) {
        handleError(error, 'Error al obtener persona');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [handleError]),

    crearPersona: useCallback(async (data: PersonaFormData) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        const response = await apiService.crearPersona(data);
        dispatch({ type: ActionTypes.ADD_PERSONA, payload: response.data });
        showSuccess('Persona creada exitosamente');
        
        // ✅ Limpiar cache para recargar datos
        lastParamsRef.current = '';
        
        return response.data;
      } catch (error) {
        handleError(error, 'Error al crear persona');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [handleError, showSuccess]),

    actualizarPersona: useCallback(async (id: number, data: Partial<PersonaFormData>) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        const response = await apiService.actualizarPersona(id, data);
        dispatch({ type: ActionTypes.UPDATE_PERSONA, payload: response.data });
        showSuccess('Persona actualizada exitosamente');
        return response.data;
      } catch (error) {
        handleError(error, 'Error al actualizar persona');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [handleError, showSuccess]),

    eliminarPersona: useCallback(async (id: number) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      try {
        await apiService.eliminarPersona(id);
        dispatch({ type: ActionTypes.REMOVE_PERSONA, payload: id });
        showSuccess('Persona eliminada exitosamente');
        
        // ✅ Limpiar cache para recargar datos
        lastParamsRef.current = '';
        
      } catch (error) {
        handleError(error, 'Error al eliminar persona');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [handleError, showSuccess]),

    setFiltros: useCallback((filtros: Partial<FiltrosPersona>) => {
      dispatch({ type: ActionTypes.SET_FILTROS, payload: filtros });
      // ✅ Limpiar cache cuando cambian los filtros
      lastParamsRef.current = '';
    }, []),

    clearFiltros: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_FILTROS });
      // ✅ Limpiar cache cuando se limpian los filtros
      lastParamsRef.current = '';
    }, []),

    setPaginacion: useCallback((paginacion: Partial<PersonaState['paginacion']>) => {
      dispatch({ type: ActionTypes.SET_PAGINACION, payload: paginacion });
      // ✅ Limpiar cache cuando cambia la paginación
      lastParamsRef.current = '';
    }, []),

    setOrdenamiento: useCallback((campo: string, direccion: 'asc' | 'desc') => {
      dispatch({ 
        type: ActionTypes.SET_ORDENAMIENTO, 
        payload: { campo, direccion } 
      });
      // ✅ Limpiar cache cuando cambia el ordenamiento
      lastParamsRef.current = '';
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }, []),

    clearPersonaActual: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_PERSONA_ACTUAL });
    }, [])
  };

  // Computed values
  const computed: PersonaComputed = {
    totalPersonas: state.personas.length,
    personasConPrestamos: state.personas.filter(p => p._count && p._count.prestamos > 0),
    personasSinPrestamos: state.personas.filter(p => !p._count || p._count.prestamos === 0)
  };

  const value: PersonaContextType = {
    ...state,
    ...actions,
    ...computed
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
};

// Hook para usar el contexto
export const usePersona = (): PersonaContextType => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona debe ser usado dentro de PersonaProvider');
  }
  return context;
};

export default PersonaContext;