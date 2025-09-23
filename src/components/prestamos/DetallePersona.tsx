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
      <FormularioPago
        prestamo={prestamo}
        onPagoRegistrado={handlePagoRegistrado}
        onCancelar={() => setMostrarFormularioPago(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onVolver}
            className="flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </Button>
          
          <StatusBadge 
            status={prestamo.estado}
            type="prestamo"
          />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {nombreCompleto}
          </h1>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-1 sm:space-y-0 sm:space-x-4 text-gray-600">
            {prestamo.persona?.telefono && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {prestamo.persona.telefono}
              </div>
            )}
            {prestamo.persona?.email && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {prestamo.persona.email}
              </div>
            )}
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-1">Monto Total</p>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrency(prestamo.montoTotal)}
            </p>
          </div>
          
          <div className="bg-success-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-success-700 mb-1">Pagado</p>
            <p className="text-xl font-bold text-success-800">
              {formatCurrency(prestamo.montoPagado)}
            </p>
          </div>
          
          <div className={`rounded-lg p-4 text-center ${
            prestamo.completado ? 'bg-success-50' : 'bg-warning-50'
          }`}>
            <div className="flex items-center justify-center mb-2">
              <svg className={`w-6 h-6 ${prestamo.completado ? 'text-success-500' : 'text-warning-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-sm mb-1 ${
              prestamo.completado ? 'text-success-700' : 'text-warning-700'
            }`}>
              {prestamo.completado ? 'Completado' : 'Restante'}
            </p>
            <p className={`text-xl font-bold ${
              prestamo.completado ? 'text-success-800' : 'text-warning-800'
            }`}>
              {formatCurrency(prestamo.montoRestante)}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progreso de pago</span>
            <span>{Math.round(porcentajePagado)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                prestamo.completado ? 'bg-success-500' : 'bg-warning-500'
              }`}
              style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
            />
          </div>
        </div>

        {/* Información adicional del préstamo */}
        {(prestamo.descripcion || prestamo.fechaVencimiento || prestamo.tasaInteres > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {prestamo.descripcion && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-medium mb-1">Descripción:</p>
                <p className="text-blue-800">"{prestamo.descripcion}"</p>
              </div>
            )}
            
            <div className="space-y-2">
              {prestamo.fechaVencimiento && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha de vencimiento:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatDate(prestamo.fechaVencimiento)}
                  </span>
                </div>
              )}
              
              {prestamo.tasaInteres > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasa de interés:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {prestamo.tasaInteres}%
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cuotas:</span>
                <span className="text-sm font-medium text-gray-800">
                  {prestamo.cuotasPagadas}/{prestamo.cuotasPactadas}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fechas importantes */}
        <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-4">
          <p>
            Préstamo creado el {formatDate(prestamo.fechaPrestamo, 'dd/MM/yyyy HH:mm')}
          </p>
          {prestamo.fechaCompletado && (
            <p className="text-success-600 font-medium mt-1">
              Completado el {formatDate(prestamo.fechaCompletado, 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </div>

        {!prestamo.completado && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => setMostrarFormularioPago(true)}
              disabled={loading}
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Registrar Pago
            </Button>
          </div>
        )}
      </Card>

      {/* Historial de pagos */}
      <HistorialPagos
        prestamo={prestamo}
        onPagoActualizado={actualizarPrestamo}
      />
    </div>
  );
};

export default DetallePersona;
