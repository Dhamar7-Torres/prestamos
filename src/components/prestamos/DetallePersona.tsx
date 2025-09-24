import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate, formatTimeAgo } from '@/utils/formatters';
import { calculateProgress } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import StatusBadge from '@/components/common/StatusBadge';
import FormularioPago from '@/components/pagos/FormularioPago';
import HistorialPagos from '@/components/pagos/HistorialPagos';
import apiService from '@/services/api';
import type { Prestamo, PagoFormData } from '@/types';

interface DetallePersonaProps {
  prestamo: Prestamo;
  onVolver: () => void;
  onActualizado: (prestamo: Prestamo) => void;
}

const DetallePersona: React.FC<DetallePersonaProps> = ({ 
  prestamo: prestamoInicial, 
  onVolver, 
  onActualizado 
}) => {
  const [prestamo, setPrestamo] = useState<Prestamo>(prestamoInicial);
  const [mostrarFormularioPago, setMostrarFormularioPago] = useState(false);
  const [loading, setLoading] = useState(false);

  const actualizarPrestamo = async () => {
    try {
      const response = await apiService.obtenerPrestamo(prestamo.id);
      setPrestamo(response.data);
      onActualizado(response.data);
    } catch (error) {
      console.error('Error al actualizar préstamo:', error);
    }
  };

  const handlePagoRegistrado = async (dataPago: Omit<PagoFormData, 'prestamoId'>) => {
    setLoading(true);
    try {
      const pagoCompleto: PagoFormData = {
        ...dataPago,
        prestamoId: prestamo.id
      };
      
      await apiService.crearPago(pagoCompleto);
      await actualizarPrestamo();
      setMostrarFormularioPago(false);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const porcentajePagado = calculateProgress(prestamo.montoPagado, prestamo.montoTotal);
  const nombreCompleto = prestamo.persona 
    ? `${prestamo.persona.nombre} ${prestamo.persona.apellido || ''}`.trim()
    : 'Sin información';

  if (mostrarFormularioPago) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <FormularioPago
            prestamo={prestamo}
            onPagoRegistrado={handlePagoRegistrado}
            onCancelar={() => setMostrarFormularioPago(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <button
              onClick={onVolver}
              className="flex items-center p-2 hover:bg-white/20 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4">
              <StatusBadge 
                status={prestamo.estado}
                type="prestamo"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              {nombreCompleto}
            </h1>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-1 sm:space-y-0 sm:space-x-4 text-gray-700">
              {prestamo.persona?.telefono && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium text-gray-900">{prestamo.persona.telefono}</span>
                </div>
              )}
              {prestamo.persona?.email && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium text-gray-900">{prestamo.persona.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 mb-1">Monto Total</p>
              <p className="text-xl font-medium text-gray-900">
                {formatCurrency(prestamo.montoTotal)}
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 mb-1">Pagado</p>
              <p className="text-xl font-semibold text-emerald-600">
                {formatCurrency(prestamo.montoPagado)}
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className={`w-6 h-6 ${prestamo.completado ? 'text-emerald-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 mb-1">
                {prestamo.completado ? 'Completado' : 'Restante'}
              </p>
              <p className={`text-xl ${
                prestamo.completado ? 'font-semibold text-emerald-600' : 'font-semibold text-orange-600'
              }`}>
                {formatCurrency(prestamo.montoRestante)}
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span>Progreso de pago</span>
              <span className="font-medium text-gray-900">{Math.round(porcentajePagado)}%</span>
            </div>
            <div className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl h-3">
              <div 
                className={`h-3 rounded-xl transition-all duration-500 ${
                  prestamo.completado ? 'bg-emerald-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
              />
            </div>
          </div>

          {/* Información adicional del préstamo */}
          {(prestamo.descripcion || prestamo.fechaVencimiento || prestamo.tasaInteres > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {prestamo.descripcion && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Descripción:</p>
                  <p className="text-gray-700">"{prestamo.descripcion}"</p>
                </div>
              )}
              
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 space-y-2">
                {prestamo.fechaVencimiento && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Fecha de vencimiento:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(prestamo.fechaVencimiento)}
                    </span>
                  </div>
                )}
                
                {prestamo.tasaInteres > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Tasa de interés:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {prestamo.tasaInteres}%
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Cuotas:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {prestamo.cuotasPagadas}/{prestamo.cuotasPactadas}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fechas importantes */}
          <div className="text-center text-sm text-gray-700 border-t border-white/20 pt-4">
            <p>
              Préstamo creado el <span className="font-medium text-gray-900">{formatDate(prestamo.fechaPrestamo, 'dd/MM/yyyy HH:mm')}</span>
            </p>
            {prestamo.fechaCompletado && (
              <p className="font-semibold text-emerald-600 mt-1">
                Completado el {formatDate(prestamo.fechaCompletado, 'dd/MM/yyyy HH:mm')}
              </p>
            )}
          </div>

          {!prestamo.completado && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setMostrarFormularioPago(true)}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Registrar Pago
              </button>
            </div>
          )}
        </div>

        {/* Historial de pagos */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl">
          <HistorialPagos
            prestamo={prestamo}
            onPagoActualizado={actualizarPrestamo}
          />
        </div>
      </div>
    </div>
  );
};

export default DetallePersona;