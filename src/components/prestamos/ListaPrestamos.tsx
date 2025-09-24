import React from 'react';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import PrestamoCard from './PrestamoCard';
import EmptyState from '@/components/common/EmptyState';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import type { Prestamo } from '@/types';

interface ListaPrestamosProps {
  prestamos: Prestamo[];
  titulo: string;
  completado?: boolean;
  onPrestamoClick: (prestamo: Prestamo) => void;
  onNuevoPrestamo?: () => void;
}

const ListaPrestamos: React.FC<ListaPrestamosProps> = ({ 
  prestamos, 
  titulo, 
  completado = false, 
  onPrestamoClick,
  onNuevoPrestamo 
}) => {
  const prestamosFiltrados = prestamos.filter(p => p.completado === completado);

  if (prestamosFiltrados.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
            <EmptyState
              title={completado ? 'No hay préstamos completados' : 'No hay préstamos pendientes'}
              description={
                completado 
                  ? 'Los préstamos completados aparecerán aquí una vez que sean pagados completamente'
                  : 'Crea tu primer préstamo para comenzar a gestionar tus finanzas'
              }
              icon={
                <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              action={!completado && onNuevoPrestamo ? {
                label: 'Crear Primer Préstamo',
                onClick: onNuevoPrestamo
              } : undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  const montoTotal = prestamosFiltrados.reduce((sum, p) => sum + Number(p.montoTotal), 0);
  const montoPagado = prestamosFiltrados.reduce((sum, p) => sum + Number(p.montoPagado), 0);
  const montoPendiente = prestamosFiltrados.reduce((sum, p) => sum + Number(p.montoRestante), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 space-y-6">
        {/* Header con estadísticas */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-2">{titulo}</h2>
              <p className="text-gray-700">
                Gestiona y da seguimiento a tus {completado ? 'préstamos completados' : 'préstamos pendientes'}
              </p>
            </div>
            
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4">
              <Badge 
                variant={completado ? 'success' : 'warning'}
                size="lg"
              >
                {prestamosFiltrados.length} {prestamosFiltrados.length === 1 ? 'préstamo' : 'préstamos'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-700 mb-1">Monto total</p>
                  <p className="text-2xl font-medium text-gray-900">
                    {formatCurrency(montoTotal)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-700 mb-1">Monto pagado</p>
                  <p className="text-2xl font-semibold text-emerald-600">
                    {formatCurrency(montoPagado)}
                  </p>
                </div>
              </div>
            </div>
            
            {!completado && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-700 mb-1">Por entregar</p>
                    <p className="text-2xl font-semibold text-orange-600">
                      {formatCurrency(montoPendiente)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {completado && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-700 mb-1">Tasa de recuperación</p>
                    <p className="text-2xl font-medium text-gray-900">
                      {formatPercentage(montoPagado, montoTotal)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de préstamos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prestamosFiltrados.map(prestamo => (
            <div key={prestamo.id} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl">
              <PrestamoCard
                prestamo={prestamo}
                completado={completado}
                onClick={onPrestamoClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListaPrestamos;