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
      <Card>
        <EmptyState
          title="No hay pagos registrados"
          description="Los pagos aparecerán aquí una vez que sean registrados"
          icon={
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Historial de Pagos ({pagos.length})
          </h2>
          
          <div className="text-sm text-gray-500">
            Total pagado: {formatCurrency(prestamo.montoPagado)}
          </div>
        </div>
        
        <div className="space-y-4">
          {pagos.map((pago) => (
            <div key={pago.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg font-bold text-success-700">
                      {formatCurrency(pago.monto)}
                    </span>
                    
                    <Badge variant="info" size="sm">
                      {formatMetodoPago(pago.metodoPago)}
                    </Badge>
                    
                    {pago.esCuota && (
                      <Badge variant="primary" size="sm">
                        Cuota #{pago.numeroCuota}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Fecha:</span> {formatDate(pago.fechaPago)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(pago.fechaPago)}
                    </p>
                    
                    {pago.numeroTransaccion && (
                      <p>
                        <span className="font-medium">Transacción:</span> {pago.numeroTransaccion}
                      </p>
                    )}
                    
                    {pago.descripcion && (
                      <p>
                        <span className="font-medium">Descripción:</span> {pago.descripcion}
                      </p>
                    )}

                    {/* Mostrar componentes del pago si están definidos */}
                    {(Number(pago.montoCapital) > 0 || Number(pago.montoInteres) > 0 || Number(pago.montoMora) > 0) && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-xs font-medium text-gray-700 mb-2">Distribución del pago:</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Capital:</span>
                            <span className="ml-1 font-medium">{formatCurrency(pago.montoCapital)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Interés:</span>
                            <span className="ml-1 font-medium">{formatCurrency(pago.montoInteres)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Mora:</span>
                            <span className="ml-1 font-medium">{formatCurrency(pago.montoMora)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-xs text-gray-500">
                    ID: {pago.id}
                  </span>
                  
                  {!prestamo.completado && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setPagoAEliminar(pago.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

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
    </>
  );
};

export default HistorialPagos;