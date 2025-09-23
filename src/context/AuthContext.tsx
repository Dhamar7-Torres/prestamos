import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { LOCAL_STORAGE_KEYS } from '@/utils/constants';
import type { User } from '@/types';

// Estado inicial
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  role: string | null;
  sessionExpiry: string | null;
  lastActivity: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: [],
  role: null,
  sessionExpiry: null,
  lastActivity: null
};

// Action Types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_PERMISSIONS: 'UPDATE_PERMISSIONS',
  UPDATE_LAST_ACTIVITY: 'UPDATE_LAST_ACTIVITY',
  SESSION_EXPIRED: 'SESSION_EXPIRED'
} as const;

type ActionType = typeof ActionTypes[keyof typeof ActionTypes];

interface AuthAction {
  type: ActionType;
  payload?: any;
}

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        permissions: action.payload.permissions || [],
        role: action.payload.role || 'user',
        sessionExpiry: action.payload.sessionExpiry,
        lastActivity: new Date().toISOString()
      };
      
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...initialState,
        isLoading: false
      };
      
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };
      
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
      
    case ActionTypes.UPDATE_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload
      };
      
    case ActionTypes.UPDATE_LAST_ACTIVITY:
      return {
        ...state,
        lastActivity: new Date().toISOString()
      };
      
    case ActionTypes.SESSION_EXPIRED:
      return {
        ...initialState,
        isLoading: false
      };
      
    default:
      return state;
  }
};

// Login credentials interface
interface LoginCredentials {
  email: string;
  password?: string;
}

// Login result interface
interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Actions interface
interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: (reason?: string) => void;
  updateUser: (userData: Partial<User>) => void;
  updatePermissions: (permissions: string[]) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  renewSession: () => Promise<boolean>;
  isSessionValid: () => boolean;
  getSessionTimeRemaining: () => number;
}

// Computed values interface
interface AuthComputed {
  isAdmin: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  sessionTimeRemaining: number;
  isSessionExpiring: boolean;
}

type AuthContextType = AuthState & AuthActions & AuthComputed;

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Actions (definimos antes de useEffect para evitar dependencias circulares)
  const actions: AuthActions = {
    // Simular login (para futura implementación con API real)
    login: async (credentials: LoginCredentials): Promise<LoginResult> => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      try {
        const mockUser: User = {
          id: 1,
          nombre: 'Usuario Demo',
          email: credentials.email || 'demo@prestamos.app',
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin']
        };

        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + 8);

        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: {
            user: mockUser,
            role: mockUser.role,
            permissions: mockUser.permissions,
            sessionExpiry: sessionExpiry.toISOString()
          }
        });

        return { success: true, user: mockUser };
      } catch (error: any) {
        dispatch({ type: ActionTypes.LOGIN_FAILURE });
        return { success: false, error: error.message };
      }
    },

    logout: (reason: string = 'Usuario desconectado') => {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_DATA);
      dispatch({ type: ActionTypes.LOGOUT });
      console.log('Logout:', reason);
    },

    updateUser: (userData: Partial<User>) => {
      dispatch({ type: ActionTypes.UPDATE_USER, payload: userData });
    },

    updatePermissions: (permissions: string[]) => {
      dispatch({ type: ActionTypes.UPDATE_PERMISSIONS, payload: permissions });
    },

    hasPermission: (permission: string): boolean => {
      return state.permissions.includes(permission) || state.role === 'admin';
    },

    hasRole: (role: string): boolean => {
      return state.role === role;
    },

    renewSession: async (): Promise<boolean> => {
      if (!state.isAuthenticated) return false;

      try {
        const newExpiry = new Date();
        newExpiry.setHours(newExpiry.getHours() + 8);

        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: {
            ...state,
            sessionExpiry: newExpiry.toISOString()
          }
        });

        return true;
      } catch (error) {
        console.error('Error renovando sesión:', error);
        actions.logout('Error al renovar sesión');
        return false;
      }
    },

    isSessionValid: (): boolean => {
      if (!state.isAuthenticated || !state.sessionExpiry) return false;
      return new Date(state.sessionExpiry) > new Date();
    },

    getSessionTimeRemaining: (): number => {
      if (!state.sessionExpiry) return 0;
      
      const now = new Date();
      const expiry = new Date(state.sessionExpiry);
      const diffMs = expiry.getTime() - now.getTime();
      
      return Math.max(0, Math.floor(diffMs / (1000 * 60)));
    }
  };

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      try {
        const savedAuth = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_DATA);
        
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          
          if (authData.sessionExpiry && new Date(authData.sessionExpiry) > new Date()) {
            dispatch({ 
              type: ActionTypes.LOGIN_SUCCESS, 
              payload: authData 
            });
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_DATA);
            dispatch({ type: ActionTypes.SESSION_EXPIRED });
          }
        } else {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_DATA);
        dispatch({ type: ActionTypes.LOGIN_FAILURE });
      }
    };

    initializeAuth();
  }, []);

  // Guardar datos de autenticación en localStorage
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      const authData = {
        user: state.user,
        permissions: state.permissions,
        role: state.role,
        sessionExpiry: state.sessionExpiry
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_DATA, JSON.stringify(authData));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_DATA);
    }
  }, [state.isAuthenticated, state.user, state.permissions, state.role, state.sessionExpiry]);

  // Computed values
  const computed: AuthComputed = {
    isAdmin: state.role === 'admin',
    canRead: actions.hasPermission('read'),
    canWrite: actions.hasPermission('write'),
    canDelete: actions.hasPermission('delete'),
    sessionTimeRemaining: actions.getSessionTimeRemaining(),
    isSessionExpiring: actions.getSessionTimeRemaining() < 15
  };

  const value: AuthContextType = {
    ...state,
    ...actions,
    ...computed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;