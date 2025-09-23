import React from 'react';
import { formatCurrency, formatTimeAgo, formatPercentage } from '@/utils/formatters';
import { calculateProgress } from '@/utils/helpers';
import { classNames } from '@/utils/helpers';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import StatusBadge from '@/components/common/StatusBadge';
import type { Prestamo } from '@/types';

interface PrestamoCardProps {
  prestamo: Prestamo;
  onClick: (prestamo: Prestamo) => void;
  completado?: boolean;
}

const PrestamoCard: React.FC<PrestamoCardProps> = ({ 
  prestamo, 
  onClick, 
  completado = false 
}) => {
  const porcentajePagado = calculateProgress(prestamo.montoPagado, prestamo.montoTotal);
  const nombreCompleto = prestamo.persona 
    ? `${prestamo.persona.nombre} ${prestamo.persona.apellido || ''}`.trim()
    : 'Sin información';

  return (
    <Card
      hoverable
      onClick={() => onClick(prestamo)}
      className={classNames(
        'border-l-4 transition-all duration-200',
        completado 
          ? 'border-l-success-500 bg-success-50' 
          : 'border-l-warning-500 hover:border-l-primary-500'
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {nombreCompleto}
          </h3>
          {prestamo.persona?.telefono && (
            <p className="text-sm text-gray-500">
              📞 {prestamo.persona.telefono}
            </p>
          )}
          {prestamo.persona?.email && (
            <p className="text-sm text-gray-500">
              ✉️ {prestamo.persona.email}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <StatusBadge 
            status={prestamo.estado}
            type="prestamo"
          />
          <Badge 
            variant={completado ? 'success' : 'warning'} 
            size="sm"
          >
            {completado ? 'PAGADO' : 'PENDIENTE'}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Monto total:</span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(prestamo.montoTotal)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Pagado:</span>
          <span className="font-semibold text-success-600">
            {formatCurrency(prestamo.montoPagado)}
          </span>
        </div>

        {!completado && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Restante:</span>
            <span className="font-semibold text-warning-600">
              {formatCurrency(prestamo.montoRestante)}
            </span>
          </div>
        )}

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso de pago</span>
            <span>{formatPercentage(prestamo.montoPagado, prestamo.montoTotal)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={classNames(
                'h-2 rounded-full transition-all duration-300',
                completado ? 'bg-success-500' : 'bg-warning-500'
              )}
              style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
            />
          </div>
        </div>

        {/* Información del préstamo */}
        {prestamo.descripcion && (
          <div className="bg-blue-50 rounded-lg p-3 mt-3">
            <p className="text-sm text-blue-700 italic">
              "{prestamo.descripcion}"
            </p>
          </div>
        )}

        {/* Información de tiempo */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-400">
            <span>
              Creado {formatTimeAgo(prestamo.createdAt)}
            </span>
            {prestamo.fechaVencimiento && (
              <span className={classNames(
                'font-medium',
                new Date(prestamo.fechaVencimiento) < new Date() && !completado
                  ? 'text-red-500'
                  : 'text-gray-500'
              )}>
                {new Date(prestamo.fechaVencimiento) < new Date() && !completado 
                  ? 'Vencido'
                  : `Vence: ${new Date(prestamo.fechaVencimiento).toLocaleDateString()}`
                }
              </span>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Cuotas: {prestamo.cuotasPagadas}/{prestamo.cuotasPactadas}</span>
          {prestamo._count?.pagos && (
            <span>{prestamo._count.pagos} pagos registrados</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PrestamoCard;