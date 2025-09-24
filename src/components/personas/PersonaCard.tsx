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
    <div
      onClick={() => onClick(persona)}
      className={classNames(
        'bg-white/20 backdrop-blur-md border border-white/30 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/25 hover:border-white/40 hover:shadow-lg',
        tienePrestamos 
          ? 'border-l-4 border-l-emerald-500 hover:border-l-emerald-600' 
          : 'border-l-4 border-l-orange-500 hover:border-l-orange-600'
      )}
    >
      {/* Layout compacto de lista */}
      <div className="flex items-center justify-between p-4">
        
        {/* Avatar y nombre */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className={classNames(
              'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm backdrop-blur-sm border border-white/30',
              tienePrestamos 
                ? 'bg-emerald-500/80' 
                : 'bg-orange-500/80'
            )}>
              {persona.nombre.charAt(0).toUpperCase()}
              {persona.apellido ? persona.apellido.charAt(0).toUpperCase() : ''}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {nombreCompleto}
            </h3>
            <div className="flex items-center space-x-3 text-xs text-gray-700 mt-1">
              {persona.telefono && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {persona.telefono}
                </span>
              )}
              {persona.email && (
                <span className="flex items-center truncate">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {persona.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Información compacta del lado derecho */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          
          {/* Badge de préstamos */}
          <div className="text-xs px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-gray-700 border border-white/30">
            {cantidadPrestamos} préstamo{cantidadPrestamos !== 1 ? 's' : ''}
          </div>
          
          {/* Fecha compacta */}
          <div className="text-right">
            <div className="text-xs text-gray-700">
              {formatTimeAgo(persona.createdAt)}
            </div>
            <div className={classNames(
              'text-xs font-medium',
              tienePrestamos ? 'text-emerald-600' : 'text-orange-600'
            )}>
              {tienePrestamos ? 'Activo' : 'Sin préstamos'}
            </div>
          </div>

          {/* Indicador de acción */}
          <div className="text-gray-700 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaCard;