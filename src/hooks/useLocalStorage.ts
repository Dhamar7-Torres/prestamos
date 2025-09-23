import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  // Función para leer del localStorage
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error leyendo localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Función para escribir en localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(`Intentando escribir localStorage en servidor para key "${key}"`);
      return;
    }

    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(newValue);
      
      if (newValue === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
      
      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(
        new CustomEvent('local-storage', {
          detail: { key, newValue }
        })
      );
    } catch (error) {
      console.warn(`Error escribiendo localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Escuchar cambios en localStorage (entre pestañas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;
      setStoredValue(readValue());
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key !== key) return;
      setStoredValue(e.detail.newValue);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
};

// Hook para múltiples valores de localStorage
interface LocalStorageKey<T> {
  key: string;
  initialValue: T;
}

export const useMultipleLocalStorage = <T extends Record<string, any>>(
  keys: LocalStorageKey<any>[]
): [T, (key: string, value: any) => void] => {
  const [values, setValues] = useState<T>(() => {
    const initialValues = {} as T;
    keys.forEach(({ key, initialValue }) => {
      initialValues[key as keyof T] = initialValue;
    });
    return initialValues;
  });

  // Leer todos los valores al montar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readValues = {} as T;
    keys.forEach(({ key, initialValue }) => {
      try {
        const item = localStorage.getItem(key);
        readValues[key as keyof T] = item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.warn(`Error leyendo localStorage key "${key}":`, error);
        readValues[key as keyof T] = initialValue;
      }
    });
    setValues(readValues);
  }, [keys]);

  const updateValue = useCallback((key: string, value: any) => {
    if (typeof window === 'undefined') return;

    try {
      const newValue = value instanceof Function ? value(values[key as keyof T]) : value;
      
      setValues(prev => ({ ...prev, [key]: newValue }));
      
      if (newValue === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Error escribiendo localStorage key "${key}":`, error);
    }
  }, [values]);

  return [values, updateValue];
};

export default useLocalStorage;