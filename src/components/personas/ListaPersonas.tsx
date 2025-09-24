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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando personas</h3>
          <p className="text-gray-500">Obteniendo información del sistema...</p>
        </div>
      </div>
    );
  }

  if (personasFiltradas.length === 0 && !loading) {
    return (
      <div className="space-y-8">
        {/* Header con filtros - Versión mejorada */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50/30 rounded-2xl shadow-xl border border-gray-100/50 backdrop-blur-sm">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                  Personas
                </h2>
                <p className="text-gray-600 text-lg">
                  Gestiona la información de todas las personas registradas
                </p>
              </div>
              
              {onNuevaPersona && (
                <Button 
                  onClick={onNuevaPersona}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Persona
                </Button>
              )}
            </div>

            {/* Filtros mejorados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="relative group">
                <Input
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={filtros.busqueda || ''}
                  onChange={(e) => handleBusquedaChange(e.target.value)}
                  fullWidth
                  className="pl-12 border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-500/20 rounded-xl transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Select
                  options={filtrosOptions}
                  value={getCurrentFilter()}
                  onChange={(e) => handleFiltroChange(e.target.value)}
                  placeholder="Filtrar personas..."
                  fullWidth
                  className="border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                />
                
                <Button
                  variant="secondary"
                  onClick={clearFiltros}
                  disabled={!filtros.busqueda && filtros.conPrestamos === undefined}
                  className="px-6 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200"
                >
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Estadísticas mejoradas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total personas</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalPersonas}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-medium text-blue-700 mb-1">Con préstamos</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {personasConPrestamos.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200/50 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-medium text-emerald-700 mb-1">Sin préstamos</p>
                    <p className="text-3xl font-bold text-emerald-900">
                      {personasSinPrestamos.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          title="No se encontraron personas"
          description={
            filtros.busqueda || filtros.conPrestamos !== undefined
              ? 'No hay personas que coincidan con los filtros aplicados'
              : 'No hay personas registradas. Crea la primera persona para comenzar.'
          }
          icon={
            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con filtros - Versión con personas */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50/30 rounded-2xl shadow-xl border border-gray-100/50 backdrop-blur-sm">
        <div className="p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Personas
              </h2>
              <p className="text-gray-600 text-lg">
                Gestiona la información de todas las personas registradas
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge 
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg px-4 py-2 text-sm font-semibold"
              >
                {personasFiltradas.length} {personasFiltradas.length === 1 ? 'persona' : 'personas'}
              </Badge>
              
              {onNuevaPersona && (
                <Button 
                  onClick={onNuevaPersona}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Persona
                </Button>
              )}
            </div>
          </div>

          {/* Filtros mejorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="relative group">
              <Input
                placeholder="Buscar por nombre, teléfono o email..."
                value={filtros.busqueda || ''}
                onChange={(e) => handleBusquedaChange(e.target.value)}
                fullWidth
                className="pl-12 border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-500/20 rounded-xl transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Select
                options={filtrosOptions}
                value={getCurrentFilter()}
                onChange={(e) => handleFiltroChange(e.target.value)}
                placeholder="Filtrar personas..."
                fullWidth
                className="border-2 border-gray-200 focus:border-primary-500 rounded-xl"
              />
              
              <Button
                variant="secondary"
                onClick={clearFiltros}
                disabled={!filtros.busqueda && filtros.conPrestamos === undefined}
                className="px-6 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Estadísticas mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total personas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalPersonas}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-blue-700 mb-1">Con préstamos</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {personasConPrestamos.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200/50 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-emerald-700 mb-1">Sin préstamos</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {personasSinPrestamos.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de personas con diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {personasFiltradas.map(persona => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            onClick={onPersonaClick || (() => {})}
          />
        ))}
      </div>

      {/* Loading indicator mejorado */}
      {loading && personas.length > 0 && (
        <div className="text-center py-8">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-primary-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-500 mt-3 font-medium">Cargando más personas...</p>
        </div>
      )}
    </div>
  );
};

export default ListaPersonas;