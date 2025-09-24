import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate, formatTimeAgo, formatMetodoPago } from '@/utils/formatters';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import apiService from '@/services/api';
import type { Prestamo, Pago } from '@/types';

interface HistorialPagosProps {
  prestamo: Prestamo;
  onPagoActualizado: () => void;
}

const HistorialPagos: React.FC<HistorialPagosProps> = ({
  prestamo,
  onPagoActualizado
}) => {
  const [pagos, setPagos] = useState<Pago[]>(prestamo.pagos || []);
  const [loading, setLoading] = useState(false);
  const [pagoAEliminar, setPagoAEliminar] = useState<number | null>(null);
  const [eliminandoPago, setEliminandoPago] = useState(false);

  useEffect(() => {
    setPagos(prestamo.pagos || []);
  }, [prestamo.pagos]);

  const handleEliminarPago = async (pagoId: number) => {
    setEliminandoPago(true);
    
    try {
      await apiService.eliminarPago(pagoId);
      setPagos(pagos.filter(p => p.id !== pagoId));
      onPagoActualizado();
      setPagoAEliminar(null);
    } catch (error) {
      console.error('Error eliminando pago:', error);
    } finally {
      setEliminandoPago(false);
    }
  };

  if (pagos.length === 0) {
    return (
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
        <EmptyState
          title="No hay pagos registrados"
          description="Los pagos aparecerán aquí una vez que sean registrados"
          icon={
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-light text-gray-900">
                Historial de Pagos ({pagos.length})
              </h2>
              <div className="text-sm text-gray-700">
                Total pagado: <span className="font-semibold text-emerald-600">{formatCurrency(prestamo.montoPagado)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de Pagos */}
      <div className="space-y-4">
        {pagos.map((pago) => (
          <div key={pago.id} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 hover:bg-white/25 transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  
                  <span className="text-lg font-medium text-gray-900">
                    {formatCurrency(pago.monto)}
                  </span>
                  
                  <div className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    {formatMetodoPago(pago.metodoPago)}
                  </div>
                  
                  {pago.esCuota && (
                    <div className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30">
                      Cuota #{pago.numeroCuota}
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-700 space-y-1 ml-14">
                  <p>
                    <span className="font-medium text-gray-900">Fecha:</span> {formatDate(pago.fechaPago)}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    {formatTimeAgo(pago.fechaPago)}
                  </p>
                  
                  {pago.numeroTransaccion && (
                    <p>
                      <span className="font-medium text-gray-900">Transacción:</span> {pago.numeroTransaccion}
                    </p>
                  )}
                  
                  {pago.descripcion && (
                    <p>
                      <span className="font-medium text-gray-900">Descripción:</span> {pago.descripcion}
                    </p>
                  )}

                  {/* Mostrar componentes del pago si están definidos */}
                  {(Number(pago.montoCapital) > 0 || Number(pago.montoInteres) > 0 || Number(pago.montoMora) > 0) && (
                    <div className="mt-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-900 mb-2">Distribución del pago:</p>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 text-center">
                          <span className="text-gray-700 block">Capital</span>
                          <span className="font-medium text-gray-900">{formatCurrency(pago.montoCapital)}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 text-center">
                          <span className="text-gray-700 block">Interés</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(pago.montoInteres)}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 text-center">
                          <span className="text-gray-700 block">Mora</span>
                          <span className="font-semibold text-red-600">{formatCurrency(pago.montoMora)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30">
                  ID: {pago.id}
                </span>
                
                {!prestamo.completado && (
                  <button
                    onClick={() => setPagoAEliminar(pago.id)}
                    className="p-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/30 text-red-700 hover:text-red-800 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={pagoAEliminar !== null}
        onClose={() => setPagoAEliminar(null)}
        onConfirm={() => pagoAEliminar && handleEliminarPago(pagoAEliminar)}
        title="Eliminar Pago"
        message="¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer y recalculará automáticamente los totales del préstamo."
        confirmText="Eliminar"
        variant="danger"
        loading={eliminandoPago}
      />
    </div>
  );
};

export default HistorialPagos;