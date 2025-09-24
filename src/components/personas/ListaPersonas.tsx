import React, { useEffect } from 'react';
import PersonaCard from './PersonaCard';
import EmptyState from '@/components/common/EmptyState';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { usePersona } from '@/context/PersonaContext';
import type { Personas } from '@/types';

interface ListaPersonasProps {
  onPersonaClick?: (persona: Personas) => void;
  onNuevaPersona?: () => void;
}

const ListaPersonas: React.FC<ListaPersonasProps> = ({ 
  onPersonaClick,
  onNuevaPersona 
}) => {
  const {
    personas,
    loading,
    filtros,
    totalPersonas,
    personasConPrestamos,
    personasSinPrestamos,
    cargarPersonas,
    setFiltros,
    clearFiltros
  } = usePersona();

  // Cargar personas al montar el componente - OPTIMIZADO
  useEffect(() => {
    cargarPersonas();
  }, []); // ✅ Sin dependencias - solo al montar

  const filtrosOptions = [
    { value: '', label: 'Todas las personas' },
    { value: 'con-prestamos', label: 'Con préstamos' },
    { value: 'sin-prestamos', label: 'Sin préstamos' }
  ];

  const handleFiltroChange = (valor: string) => {
    if (valor === 'con-prestamos') {
      setFiltros({ conPrestamos: true });
    } else if (valor === 'sin-prestamos') {
      setFiltros({ conPrestamos: false });
    } else {
      setFiltros({ conPrestamos: undefined });
    }
  };

  const handleBusquedaChange = (busqueda: string) => {
    setFiltros({ busqueda });
  };

  const getCurrentFilter = () => {
    if (filtros.conPrestamos === true) return 'con-prestamos';
    if (filtros.conPrestamos === false) return 'sin-prestamos';
    return '';
  };

  const personasFiltradas = personas.filter(persona => {
    // Filtro por búsqueda
    if (filtros.busqueda && filtros.busqueda.trim()) {
      const busqueda = filtros.busqueda.toLowerCase();
      const nombre = `${persona.nombre} ${persona.apellido || ''}`.toLowerCase();
      const telefono = (persona.telefono || '').toLowerCase();
      const email = (persona.email || '').toLowerCase();
      
      if (!nombre.includes(busqueda) && 
          !telefono.includes(busqueda) && 
          !email.includes(busqueda)) {
        return false;
      }
    }
    
    return true;
  });

  if (loading && personas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center justify-center h-96">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-emerald-500 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando personas</h3>
            <p className="text-gray-700">Obteniendo información del sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  if (personasFiltradas.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 space-y-8">
          {/* Header con filtros */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-3">
                  Personas
                </h2>
                <p className="text-gray-700">
                  Gestiona la información de todas las personas registradas
                </p>
              </div>
              
              {onNuevaPersona && (
                <button
                  onClick={onNuevaPersona}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Persona
                </button>
              )}
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={filtros.busqueda || ''}
                  onChange={(e) => handleBusquedaChange(e.target.value)}
                  className="w-full bg-white/30 backdrop-blur-sm border border-white/50 rounded-xl text-gray-900 placeholder-gray-600 focus:ring-emerald-500 focus:border-transparent p-3 pl-10"
                />
                <svg className="w-5 h-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex space-x-3">
                <select
                  value={getCurrentFilter()}
                  onChange={(e) => handleFiltroChange(e.target.value)}
                  className="flex-1 bg-white/30 backdrop-blur-sm border border-white/50 rounded-xl text-gray-900 focus:ring-emerald-500 focus:border-transparent p-3"
                >
                  {filtrosOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-white text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={clearFiltros}
                  disabled={!filtros.busqueda && filtros.conPrestamos === undefined}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-700 mb-1">Total personas</p>
                    <p className="text-2xl font-medium text-gray-900">
                      {totalPersonas}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-700 mb-1">Con préstamos</p>
                    <p className="text-2xl font-semibold text-emerald-600">
                      {personasConPrestamos.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-700 mb-1">Sin préstamos</p>
                    <p className="text-2xl font-semibold text-orange-600">
                      {personasSinPrestamos.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6">
            <EmptyState
              title="No se encontraron personas"
              description={
                filtros.busqueda || filtros.conPrestamos !== undefined
                  ? 'No hay personas que coincidan con los filtros aplicados'
                  : 'No hay personas registradas. Crea la primera persona para comenzar.'
              }
              icon={
                <svg className="w-20 h-20 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              action={
                !filtros.busqueda && filtros.conPrestamos === undefined && onNuevaPersona ? {
                  label: 'Crear Primera Persona',
                  onClick: onNuevaPersona
                } : filtros.busqueda || filtros.conPrestamos !== undefined ? {
                  label: 'Limpiar Filtros',
                  onClick: clearFiltros
                } : undefined
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 space-y-8">
        {/* Header con filtros */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">
                Personas
              </h2>
              <p className="text-gray-700">
                Gestiona la información de todas las personas registradas
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3">
                <span className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-gray-700 border border-white/30">
                  {personasFiltradas.length} {personasFiltradas.length === 1 ? 'persona' : 'personas'}
                </span>
              </div>
              
              {onNuevaPersona && (
                <button
                  onClick={onNuevaPersona}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Persona
                </button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o email..."
                value={filtros.busqueda || ''}
                onChange={(e) => handleBusquedaChange(e.target.value)}
                className="w-full bg-white/30 backdrop-blur-sm border border-white/50 rounded-xl text-gray-900 placeholder-gray-600 focus:ring-emerald-500 focus:border-transparent p-3 pl-10"
              />
              <svg className="w-5 h-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex space-x-3">
              <select
                value={getCurrentFilter()}
                onChange={(e) => handleFiltroChange(e.target.value)}
                className="flex-1 bg-white/30 backdrop-blur-sm border border-white/50 rounded-xl text-gray-900 focus:ring-emerald-500 focus:border-transparent p-3"
              >
                {filtrosOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-white text-gray-900">
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={clearFiltros}
                disabled={!filtros.busqueda && filtros.conPrestamos === undefined}
                className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-700 mb-1">Total personas</p>
                  <p className="text-2xl font-medium text-gray-900">
                    {totalPersonas}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-700 mb-1">Con préstamos</p>
                  <p className="text-2xl font-semibold text-emerald-600">
                    {personasConPrestamos.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-700 mb-1">Sin préstamos</p>
                  <p className="text-2xl font-semibold text-orange-600">
                    {personasSinPrestamos.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de personas */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/20">
            {personasFiltradas.map(persona => (
              <div key={persona.id} className="hover:bg-white/10 transition-colors duration-200">
                <PersonaCard
                  persona={{ ...persona, activo: persona.activo ?? false }}
                  onClick={onPersonaClick || (() => {})}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && personas.length > 0 && (
          <div className="text-center py-8">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 inline-block">
              <div className="relative inline-block mb-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/30 border-t-emerald-500 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-gray-700 font-medium">Cargando más personas...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaPersonas;