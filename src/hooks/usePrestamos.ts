import { useState, useEffect, useCallback } from 'react';
import apiService from '@/services/api';
import { useApi } from './useApi';
import type { Prestamo, PrestamoFormData, EstadisticasPrestamos, UsePrestamosOptions, FiltrosPrestamos } from '@/types';

export const usePrestamos = (options: UsePrestamosOptions = {}) => {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPrestamos | null>(null);
  const { loading, error, execute } = useApi();

  const {
    autoLoad = true,
    filtros = {},
    ordenarPor = 'createdAt',
    orden = 'desc'
  } = options;

  // Cargar todos los préstamos
  const cargarPrestamos = useCallback(async (params: Record<string, any> = {}) => {
    const parametros = {
      ...filtros,
      ordenarPor,
      orden,
      ...params
    };

    return execute(
      () => apiService.obtenerPrestamos(parametros),
      {
        onSuccess: (response) => {
          setPrestamos(response.data.data || []);
        }
      }
    );
  }, [execute, filtros, ordenarPor, orden]);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    return execute(
      () => apiService.obtenerEstadisticasPrestamos(),
      {
        onSuccess: (response) => {
          setEstadisticas(response.data);
        },
        showLoader: false
      }
    );
  }, [execute]);

  // Obtener préstamo por ID
  const obtenerPrestamo = useCallback(async (id: number) => {
    return execute(() => apiService.obtenerPrestamo(id));
  }, [execute]);

  // Crear nuevo préstamo
  const crearPrestamo = useCallback(async (data: PrestamoFormData) => {
    const resultado = await execute(() => apiService.crearPrestamo(data));
    
    // Recargar lista después de crear
    await cargarPrestamos();
    
    return resultado;
  }, [execute, cargarPrestamos]);

  // Actualizar préstamo
  const actualizarPrestamo = useCallback(async (id: number, data: Partial<PrestamoFormData>) => {
    const resultado = await execute(() => apiService.actualizarPrestamo(id, data));
    
    // Actualizar en la lista local
    setPrestamos(prevPrestamos => 
      prevPrestamos.map(prestamo => 
        prestamo.id === id 
          ? { ...prestamo, ...resultado.data }
          : prestamo
      )
    );
    
    return resultado;
  }, [execute]);

  // Eliminar préstamo
  const eliminarPrestamo = useCallback(async (id: number) => {
    await execute(() => apiService.eliminarPrestamo(id));
    
    // Remover de la lista local
    setPrestamos(prevPrestamos => 
      prevPrestamos.filter(prestamo => prestamo.id !== id)
    );
  }, [execute]);

  // Recalcular totales
  const recalcularTotales = useCallback(async (id: number) => {
    const resultado = await execute(() => apiService.recalcularTotalesPrestamo(id));
    
    // Actualizar en la lista local
    setPrestamos(prevPrestamos => 
      prevPrestamos.map(prestamo => 
        prestamo.id === id 
          ? { ...prestamo, ...resultado.data }
          : prestamo
      )
    );
    
    return resultado;
  }, [execute]);

  // Filtrar préstamos localmente
  const prestamosFiltrados = useCallback((filtrosLocal: Partial<FiltrosPrestamos> = {}) => {
    return prestamos.filter(prestamo => {
      if (filtrosLocal.completado !== undefined) {
        if (prestamo.completado !== filtrosLocal.completado) return false;
      }
      
      if (filtrosLocal.personaId) {
        if (prestamo.persona?.id !== filtrosLocal.personaId) return false;
      }
      
      if (filtrosLocal.estado) {
        if (prestamo.estado !== filtrosLocal.estado) return false;
      }
      
      if (filtrosLocal.busqueda) {
        const busqueda = filtrosLocal.busqueda.toLowerCase();
        const nombre = prestamo.persona 
          ? `${prestamo.persona.nombre} ${prestamo.persona.apellido || ''}`.toLowerCase()
          : '';
        const descripcion = (prestamo.descripcion || '').toLowerCase();
        
        if (!nombre.includes(busqueda) && !descripcion.includes(busqueda)) {
          return false;
        }
      }
      
      return true;
    });
  }, [prestamos]);

  // Obtener préstamos por estado
  const prestamosPendientes = prestamosFiltrados({ completado: false });
  const prestamosCompletados = prestamosFiltrados({ completado: true });

  // Cargar datos inicialmente
  useEffect(() => {
    if (autoLoad) {
      cargarPrestamos();
      cargarEstadisticas();
    }
  }, [autoLoad, cargarPrestamos, cargarEstadisticas]);

  return {
    // Datos
    prestamos,
    prestamosPendientes,
    prestamosCompletados,
    estadisticas,
    
    // Estado
    loading,
    error,
    
    // Acciones
    cargarPrestamos,
    cargarEstadisticas,
    obtenerPrestamo,
    crearPrestamo,
    actualizarPrestamo,
    eliminarPrestamo,
    recalcularTotales,
    prestamosFiltrados
  };
};

export default usePrestamos;