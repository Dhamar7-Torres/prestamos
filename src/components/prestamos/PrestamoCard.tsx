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
    <div
      onClick={() => onClick(prestamo)}
      className={classNames(
        'bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:bg-white/25 hover:border-white/40 hover:shadow-lg',
        completado 
          ? 'border-l-4 border-l-emerald-500' 
          : 'border-l-4 border-l-orange-500 hover:border-l-emerald-500'
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {nombreCompleto}
          </h3>
          {prestamo.persona?.telefono && (
            <p className="text-sm text-gray-700">
              📞 {prestamo.persona.telefono}
            </p>
          )}
          {prestamo.persona?.email && (
            <p className="text-sm text-gray-700">
              ✉️ {prestamo.persona.email}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-2">
            <StatusBadge 
              status={prestamo.estado}
              type="prestamo"
            />
          </div>
          <div className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30">
            {completado ? 'PAGADO' : 'PENDIENTE'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Monto total:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(prestamo.montoTotal)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Pagado:</span>
          <span className="font-semibold text-emerald-600">
            {formatCurrency(prestamo.montoPagado)}
          </span>
        </div>

        {!completado && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Restante:</span>
            <span className="font-semibold text-orange-600">
              {formatCurrency(prestamo.montoRestante)}
            </span>
          </div>
        )}

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-700 mb-1">
            <span>Progreso de pago</span>
            <span className="font-medium text-gray-900">{formatPercentage(prestamo.montoPagado, prestamo.montoTotal)}</span>
          </div>
          <div className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl h-2">
            <div 
              className={classNames(
                'h-2 rounded-xl transition-all duration-300',
                completado ? 'bg-emerald-500' : 'bg-orange-500'
              )}
              style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
            />
          </div>
        </div>

        {/* Información del préstamo */}
        {prestamo.descripcion && (
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 mt-3">
            <p className="text-sm text-gray-700 italic">
              "{prestamo.descripcion}"
            </p>
          </div>
        )}

        {/* Información de tiempo */}
        <div className="pt-3 border-t border-white/20">
          <div className="flex justify-between text-xs text-gray-700">
            <span>
              Creado {formatTimeAgo(prestamo.createdAt)}
            </span>
            {prestamo.fechaVencimiento && (
              <span className={classNames(
                'font-medium px-2 py-1 rounded-full text-xs',
                new Date(prestamo.fechaVencimiento) < new Date() && !completado
                  ? 'bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-700'
                  : 'bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700'
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
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs text-gray-700">
            <span className="font-medium text-gray-900">Cuotas: {prestamo.cuotasPagadas}/{prestamo.cuotasPactadas}</span>
            {prestamo._count?.pagos && (
              <span className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30">
                {prestamo._count.pagos} pagos registrados
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestamoCard;