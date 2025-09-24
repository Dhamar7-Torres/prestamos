import React from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { calculateProgress } from '@/utils/helpers';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import type { Pago } from '@/types';

interface ResumenPagoProps {
  pago: Pago;
  showPrestamoInfo?: boolean;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ResumenPago: React.FC<ResumenPagoProps> = ({
  pago,
  showPrestamoInfo = false,
  className,
  onEdit,
  onDelete
}) => {
  const tieneComponentes = Number(pago.montoCapital) > 0 || Number(pago.montoInteres) > 0 || Number(pago.montoMora) > 0;

  // Estados activos del préstamo
  const estadosActivos = ['ACTIVO', 'PENDIENTE'];
  const esEstadoActivo = pago.prestamo?.estado ? estadosActivos.includes(pago.prestamo.estado as string) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className={`bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 ${className}`}>
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-2xl font-light text-gray-900">
                    {formatCurrency(pago.monto)}
                  </span>
                  
                  <div className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    {pago.metodoPago}
                  </div>
                </div>
                
                {pago.esCuota && pago.numeroCuota && (
                  <div className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30 inline-block">
                    Cuota #{pago.numeroCuota}
                  </div>
                )}
              </div>
            </div>

            {(onEdit || onDelete) && (
              <div className="flex space-x-3">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="p-2 hover:bg-white/20 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="p-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/30 text-red-700 hover:text-red-800 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Información del préstamo */}
          {showPrestamoInfo && pago.prestamo && (
            <div className="mb-6 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Información del Préstamo</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Persona:</span>
                  <span className="font-medium text-gray-900">
                    {pago.prestamo.persona ? 
                      `${pago.prestamo.persona.nombre} ${pago.prestamo.persona.apellido || ''}`.trim() :
                      'Sin información'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Monto total:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(pago.prestamo.montoTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Estado:</span>
                  <span className={`text-xs px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30 ${
                    esEstadoActivo
                      ? 'font-semibold text-emerald-600'
                      : 'text-gray-700'
                  }`}>
                    {pago.prestamo.estado}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Detalles del pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h8m-8 0V17a3 3 0 003 3v0a3 3 0 003-3V7" />
                    </svg>
                    <span className="text-gray-700">Fecha del pago:</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatDate(pago.fechaPago, 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              </div>

              {pago.numeroTransaccion && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700">Número de transacción:</span>
                    </div>
                    <span className="font-medium text-gray-900 font-mono text-sm">
                      {pago.numeroTransaccion}
                    </span>
                  </div>
                </div>
              )}

              {pago.fechaProgramada && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h8m-8 0V17a3 3 0 003 3v0a3 3 0 003-3V7" />
                      </svg>
                      <span className="text-gray-700">Fecha programada:</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatDate(pago.fechaProgramada)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Componentes del pago */}
          {tieneComponentes && (
            <div className="mb-6 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h5 className="text-lg font-medium text-gray-900">
                  Distribución del pago
                </h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <p className="text-2xl font-light text-gray-900 mb-2">
                    {formatCurrency(pago.montoCapital)}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Capital
                  </p>
                </div>
                
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <p className="text-2xl font-semibold text-orange-600 mb-2">
                    {formatCurrency(pago.montoInteres)}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Interés
                  </p>
                </div>
                
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <p className="text-2xl font-semibold text-red-600 mb-2">
                    {formatCurrency(pago.montoMora)}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Mora
                  </p>
                </div>
              </div>

              {/* Verificación de suma */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Suma de componentes:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      Number(pago.montoCapital) + Number(pago.montoInteres) + Number(pago.montoMora)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Descripción */}
          {pago.descripcion && (
            <div className="mb-6 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-gray-900">Descripción:</span>
              </div>
              <p className="text-gray-700 italic">
                "{pago.descripcion}"
              </p>
            </div>
          )}

          {/* Información de auditoría */}
          <div className="pt-6 border-t border-white/20">
            <div className="flex justify-between items-center text-sm text-gray-700">
              <span>Registrado por: <span className="font-medium text-gray-900">{pago.createdBy}</span></span>
              <span className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30">ID: {pago.id}</span>
            </div>
            <p className="text-xs text-gray-600 mb-2 mt-2">
              Creado el {formatDate(pago.createdAt, 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenPago;