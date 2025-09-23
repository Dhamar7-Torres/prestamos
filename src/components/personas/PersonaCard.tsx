import React from 'react';
import { formatTimeAgo } from '@/utils/formatters';
import { classNames } from '@/utils/helpers';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import type { Personas } from '@/types';

interface PersonaCardProps {
  persona: Personas;
  onClick: (persona: Personas) => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ 
  persona, 
  onClick 
}) => {
  const nombreCompleto = `${persona.nombre} ${persona.apellido || ''}`.trim();
  const tienePrestamos = persona._count && persona._count.prestamos > 0;
  const cantidadPrestamos = persona._count?.prestamos || 0;

  return (
    <Card
      hoverable
      onClick={() => onClick(persona)}
      className={classNames(
        'border-l-4 transition-all duration-200',
        tienePrestamos 
          ? 'border-l-blue-500 hover:border-l-primary-500' 
          : 'border-l-gray-300 hover:border-l-primary-500'
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {nombreCompleto}
          </h3>
          
          {/* Información de contacto - SIN cedula */}
          <div className="space-y-1">
            {persona.telefono && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {persona.telefono}
              </div>
            )}
            
            {persona.email && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {persona.email}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <Badge 
            variant={tienePrestamos ? 'primary' : 'secondary'} 
            size="sm"
          >
            {cantidadPrestamos} {cantidadPrestamos === 1 ? 'préstamo' : 'préstamos'}
          </Badge>
        </div>
      </div>

      {/* Información de préstamos */}
      {tienePrestamos && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Préstamos activos:</span>
            <span className="font-semibold text-gray-800">{cantidadPrestamos}</span>
          </div>
        </div>
      )}

      {/* Footer con fecha de creación */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>
            Registrado {formatTimeAgo(persona.createdAt)}
          </span>
          
          {tienePrestamos && (
            <span className="text-blue-500 font-medium">
              Ver préstamos
            </span>
          )}
          
          {!tienePrestamos && (
            <span className="text-gray-500">
              Sin préstamos
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PersonaCard;