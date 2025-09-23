import { useState, useEffect, useCallback } from 'react';
import apiService from '@/services/api';
import { useApi } from './useApi';
import type { Pago, PagoFormData, UsePagosOptions, EstadisticasPagos } from '@/types';

export const usePagos = (options: UsePagosOptions = {}) => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPagos[] | null>(null);
  const { loading, error, execute } = useApi();

  const {
    autoLoad = true,
    prestamoId,
    personaId,
    limit = 10
  } = options;

  // Cargar pagos
  const cargarPagos = useCallback(async (params: Record<string, any> = {}) => {
    const parametros = {
      limit,
      ...(prestamoId && { prestamoId }),
      ...(personaId && { personaId }),
      ...params
    };

    return execute(
      () => apiService.obtenerPagos(parametros),
      {
        onSuccess: (response) => {
          setPagos(response.data.data || []);
        }
      }
    );
  }, [execute, prestamoId, personaId, limit]);

  // Cargar estadísticas por método
  const cargarEstadisticas = useCallback(async () => {
    return execute(
      () => apiService.obtenerEstadisticasPagosPorMetodo(),
      {
        onSuccess: (response) => {
          setEstadisticas(response.data);
        },
        showLoader: false
      }
    );
  }, [execute]);

  // Obtener pago por ID
  const obtenerPago = useCallback(async (id: number) => {
    return execute(() => apiService.obtenerPago(id));
  }, [execute]);

  // Crear nuevo pago
  const crearPago = useCallback(async (data: PagoFormData) => {
    const resultado = await execute(() => apiService.crearPago(data));
    
    // Recargar lista después de crear
    await cargarPagos();
    
    return resultado;
  }, [execute, cargarPagos]);

  // Actualizar pago
  const actualizarPago = useCallback(async (id: number, data: Partial<PagoFormData>) => {
    const resultado = await execute(() => apiService.actualizarPago(id, data));
    
    // Actualizar en la lista local
    setPagos(prevPagos => 
      prevPagos.map(pago => 
        pago.id === id 
          ? { ...pago, ...resultado.data }
          : pago
      )
    );
    
    return resultado;
  }, [execute]);

  // Eliminar pago
  const eliminarPago = useCallback(async (id: number) => {
    await execute(() => apiService.eliminarPago(id));
    
    // Remover de la lista local
    setPagos(prevPagos => 
      prevPagos.filter(pago => pago.id !== id)
    );
  }, [execute]);

  // Obtener pagos por período
  const obtenerPagosPorPeriodo = useCallback(async (fechaInicio: string, fechaFin: string) => {
    return execute(() => apiService.obtenerPagosPorPeriodo(fechaInicio, fechaFin));
  }, [execute]);

  // Obtener historial de pagos de una persona
  const obtenerHistorialPersona = useCallback(async (personaIdParam: number, limite: number = 10) => {
    return execute(() => apiService.obtenerHistorialPagosPersona(personaIdParam, limite));
  }, [execute]);

  // Cargar datos inicialmente
  useEffect(() => {
    if (autoLoad) {
      cargarPagos();
      cargarEstadisticas();
    }
  }, [autoLoad, cargarPagos, cargarEstadisticas]);

  return {
    // Datos
    pagos,
    estadisticas,
    
    // Estado
    loading,
    error,
    
    // Acciones
    cargarPagos,
    cargarEstadisticas,
    obtenerPago,
    crearPago,
    actualizarPago,
    eliminarPago,
    obtenerPagosPorPeriodo,
    obtenerHistorialPersona
  };
};

export default usePagos;