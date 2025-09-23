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

  return (
    <Card className={className}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl font-bold text-success-700">
              {formatCurrency(pago.monto)}
            </span>
            
            <Badge variant="info" size="sm">
              {pago.metodoPago}
            </Badge>
          </div>
          
          {pago.esCuota && pago.numeroCuota && (
            <Badge variant="primary" size="sm">
              Cuota #{pago.numeroCuota}
            </Badge>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-600 transition-colors"
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
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-1">Información del Préstamo</h4>
          <div className="text-sm text-blue-700">
            <p>
              <span className="font-medium">Persona:</span>{' '}
              {pago.prestamo.persona ? 
                `${pago.prestamo.persona.nombre} ${pago.prestamo.persona.apellido || ''}`.trim() :
                'Sin información'
              }
            </p>
            <p>
              <span className="font-medium">Monto total:</span> {formatCurrency(pago.prestamo.montoTotal)}
            </p>
            <p>
              <span className="font-medium">Estado:</span> {pago.prestamo.estado}
            </p>
          </div>
        </div>
      )}

      {/* Detalles del pago */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Fecha del pago:</span>
          <span className="text-gray-800 font-medium">
            {formatDate(pago.fechaPago, 'dd/MM/yyyy HH:mm')}
          </span>
        </div>

        {pago.numeroTransaccion && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Número de transacción:</span>
            <span className="text-gray-800 font-medium font-mono">
              {pago.numeroTransaccion}
            </span>
          </div>
        )}

        {pago.fechaProgramada && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fecha programada:</span>
            <span className="text-gray-800 font-medium">
              {formatDate(pago.fechaProgramada)}
            </span>
          </div>
        )}

        {/* Componentes del pago */}
        {tieneComponentes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              Distribución del pago:
            </h5>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(pago.montoCapital)}
                </p>
                <p className="text-xs text-gray-600">Capital</p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-bold text-warning-700">
                  {formatCurrency(pago.montoInteres)}
                </p>
                <p className="text-xs text-gray-600">Interés</p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-bold text-red-700">
                  {formatCurrency(pago.montoMora)}
                </p>
                <p className="text-xs text-gray-600">Mora</p>
              </div>
            </div>

            {/* Verificación de suma */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Suma de componentes:</span>
                <span className="font-medium text-gray-800">
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
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Descripción:</span>
            </p>
            <p className="text-sm text-blue-800 mt-1 italic">
              "{pago.descripcion}"
            </p>
          </div>
        )}

        {/* Información de auditoría */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Registrado por: {pago.createdBy}</span>
            <span>ID: {pago.id}</span>
          </div>
          <p className="mt-1">
            Creado el {formatDate(pago.createdAt, 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ResumenPago;