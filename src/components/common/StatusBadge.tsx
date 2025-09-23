import React from 'react';
import Badge from './Badge';
import { formatEstadoPrestamo, formatMetodoPago } from '@/utils/formatters';
import type { EstadoPrestamo, MetodoPago } from '@/types';

interface StatusBadgeProps {
  status: EstadoPrestamo | MetodoPago | string;
  type?: 'prestamo' | 'pago' | 'custom';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'custom',
  className
}) => {
  const getVariantForPrestamo = (estado: EstadoPrestamo) => {
    switch (estado) {
      case 'activo':
        return 'warning';
      case 'completado':
        return 'success';
      case 'cancelado':
        return 'secondary';
      case 'vencido':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getVariantForPago = (metodo: MetodoPago) => {
    switch (metodo) {
      case 'efectivo':
        return 'success';
      case 'transferencia':
        return 'info';
      case 'tarjeta':
        return 'primary';
      case 'cheque':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getDisplayText = () => {
    switch (type) {
      case 'prestamo':
        return formatEstadoPrestamo(status).text;
      case 'pago':
        return formatMetodoPago(status);
      default:
        return status;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'prestamo':
        return getVariantForPrestamo(status as EstadoPrestamo);
      case 'pago':
        return getVariantForPago(status as MetodoPago);
      default:
        return 'secondary';
    }
  };

  return (
    <Badge
      variant={getVariant()}
      size="sm"
      rounded
      className={className}
    >
      {getDisplayText()}
    </Badge>
  );
};

export default StatusBadge;