import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { LOCAL_STORAGE_KEYS, THEME_OPTIONS } from '@/utils/constants';
import type { NotificationData } from '@/types';

// Estado inicial
interface AppState {
  theme: string;
  sidebarOpen: boolean;
  notifications: NotificationData[];
  currency: string;
  dateFormat: string;
  language: string;
  online: boolean;
  loading: boolean;
  globalFilters: Record<string, any>;
  searchTerm: string;
  activeModal: string | null;
  modalData: any;
}

const initialState: AppState = {
  theme: THEME_OPTIONS.SYSTEM,
  sidebarOpen: false,
  notifications: [],
  currency: 'COP',
  dateFormat: 'dd/MM/yyyy',
  language: 'es',
  online: navigator.onLine,
  loading: false,
  globalFilters: {},
  searchTerm: '',
  activeModal: null,
  modalData: null
};

// Action Types
const ActionTypes = {
  SET_THEME: 'SET_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR: 'SET_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_GLOBAL_FILTERS: 'SET_GLOBAL_FILTERS',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  SET_PREFERENCES: 'SET_PREFERENCES',
  RESET_PREFERENCES: 'RESET_PREFERENCES'
} as const;

type ActionType = typeof ActionTypes[keyof typeof ActionTypes];

interface AppAction {
  type: ActionType;
  payload?: any;
}

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
      
    case ActionTypes.TOGGLE_THEME:
      const newTheme = state.theme === THEME_OPTIONS.LIGHT 
        ? THEME_OPTIONS.DARK 
        : THEME_OPTIONS.LIGHT;
      return { ...state, theme: newTheme };
      
    case ActionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };
      
    case ActionTypes.SET_SIDEBAR:
      return { ...state, sidebarOpen: action.payload };
      
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...action.payload
        }]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case ActionTypes.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };
      
    case ActionTypes.SET_ONLINE_STATUS:
      return { ...state, online: action.payload };
      
    case ActionTypes.SET_GLOBAL_FILTERS:
      return { ...state, globalFilters: { ...state.globalFilters, ...action.payload } };
      
    case ActionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
      
    case ActionTypes.CLEAR_FILTERS:
      return { ...state, globalFilters: {}, searchTerm: '' };
      
    case ActionTypes.OPEN_MODAL:
      return {
        ...state,
        activeModal: action.payload.modal,
        modalData: action.payload.data || null
      };
      
    case ActionTypes.CLOSE_MODAL:
      return { ...state, activeModal: null, modalData: null };
      
    case ActionTypes.SET_PREFERENCES:
      return { ...state, ...action.payload };
      
    case ActionTypes.RESET_PREFERENCES:
      return { ...initialState, notifications: state.notifications };
      
    default:
      return state;
  }
};

// Actions interface
interface AppActions {
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebar: (isOpen: boolean) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
  showSuccess: (message: string, options?: Partial<NotificationData>) => void;
  showError: (message: string, options?: Partial<NotificationData>) => void;
  showWarning: (message: string, options?: Partial<NotificationData>) => void;
  showInfo: (message: string, options?: Partial<NotificationData>) => void;
  setGlobalFilters: (filters: Record<string, any>) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;
  setPreferences: (preferences: Partial<AppState>) => void;
  resetPreferences: () => void;
}

type AppContextType = AppState & AppActions;

// Context
const AppContext = createContext<AppContextType | null>(null);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Cargar preferencias desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: ActionTypes.SET_PREFERENCES, payload: preferences });
      }
    } catch (error) {
      console.warn('Error cargando preferencias:', error);
    }
  }, []);

  // Guardar preferencias en localStorage cuando cambien
  useEffect(() => {
    try {
      const preferences = {
        theme: state.theme,
        currency: state.currency,
        dateFormat: state.dateFormat,
        language: state.language
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Error guardando preferencias:', error);
    }
  }, [state.theme, state.currency, state.dateFormat, state.language]);

  // Detectar cambios en el estado de conexión
  useEffect(() => {
    const handleOnline = () => dispatch({ type: ActionTypes.SET_ONLINE_STATUS, payload: true });
    const handleOffline = () => dispatch({ type: ActionTypes.SET_ONLINE_STATUS, payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-remover notificaciones después de un tiempo
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    state.notifications.forEach(notification => {
      if (notification.autoRemove !== false && notification.id) {
        const timer = setTimeout(() => {
          dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notification.id });
        }, notification.duration || 5000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [state.notifications]);

  // Actions
  const actions: AppActions = {
    // Theme actions
    setTheme: (theme: string) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }),
    toggleTheme: () => dispatch({ type: ActionTypes.TOGGLE_THEME }),
    
    // UI actions
    toggleSidebar: () => dispatch({ type: ActionTypes.TOGGLE_SIDEBAR }),
    setSidebar: (isOpen: boolean) => dispatch({ type: ActionTypes.SET_SIDEBAR, payload: isOpen }),
    setLoading: (loading: boolean) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    
    // Notification actions
    addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => dispatch({ 
      type: ActionTypes.ADD_NOTIFICATION, 
      payload: notification 
    }),
    removeNotification: (id: number) => dispatch({ 
      type: ActionTypes.REMOVE_NOTIFICATION, 
      payload: id 
    }),
    clearNotifications: () => dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS }),
    
    // Convenience notification methods
    showSuccess: (message: string, options: Partial<NotificationData> = {}) => actions.addNotification({
      type: 'success',
      message,
      ...options
    }),
    showError: (message: string, options: Partial<NotificationData> = {}) => actions.addNotification({
      type: 'error',
      message,
      autoRemove: false,
      ...options
    }),
    showWarning: (message: string, options: Partial<NotificationData> = {}) => actions.addNotification({
      type: 'warning',
      message,
      ...options
    }),
    showInfo: (message: string, options: Partial<NotificationData> = {}) => actions.addNotification({
      type: 'info',
      message,
      ...options
    }),
    
    // Filter actions
    setGlobalFilters: (filters: Record<string, any>) => dispatch({ 
      type: ActionTypes.SET_GLOBAL_FILTERS, 
      payload: filters 
    }),
    setSearchTerm: (term: string) => dispatch({ 
      type: ActionTypes.SET_SEARCH_TERM, 
      payload: term 
    }),
    clearFilters: () => dispatch({ type: ActionTypes.CLEAR_FILTERS }),
    
    // Modal actions
    openModal: (modal: string, data: any = null) => dispatch({
      type: ActionTypes.OPEN_MODAL,
      payload: { modal, data }
    }),
    closeModal: () => dispatch({ type: ActionTypes.CLOSE_MODAL }),
    
    // Preference actions
    setPreferences: (preferences: Partial<AppState>) => dispatch({
      type: ActionTypes.SET_PREFERENCES,
      payload: preferences
    }),
    resetPreferences: () => dispatch({ type: ActionTypes.RESET_PREFERENCES })
  };

  const value: AppContextType = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook para usar el contexto
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
};

export default AppContext;