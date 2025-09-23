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

  // Cargar personas al montar el componente
  useEffect(() => {
    cargarPersonas();
  }, [cargarPersonas]);

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando personas...</p>
        </div>
      </div>
    );
  }

  if (personasFiltradas.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        {/* Header con filtros */}
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personas</h2>
              <p className="text-gray-600">
                Gestiona la información de todas las personas registradas
              </p>
            </div>
            
            {onNuevaPersona && (
              <Button onClick={onNuevaPersona}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Persona
              </Button>
            )}
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Input
                placeholder="Buscar por nombre, teléfono o email..."
                value={filtros.busqueda || ''}
                onChange={(e) => handleBusquedaChange(e.target.value)}
                fullWidth
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Select
                options={filtrosOptions}
                value={getCurrentFilter()}
                onChange={(e) => handleFiltroChange(e.target.value)}
                placeholder="Filtrar personas..."
                fullWidth
              />
              
              <Button
                variant="secondary"
                onClick={clearFiltros}
                disabled={!filtros.busqueda && filtros.conPrestamos === undefined}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 mb-1">Total personas</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {totalPersonas}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-blue-700 mb-1">Con préstamos</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {personasConPrestamos.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 mb-1">Sin préstamos</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {personasSinPrestamos.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <EmptyState
          title="No se encontraron personas"
          description={
            filtros.busqueda || filtros.conPrestamos !== undefined
              ? 'No hay personas que coincidan con los filtros aplicados'
              : 'No hay personas registradas. Crea la primera persona para comenzar.'
          }
          icon={
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="space-y-6">
      {/* Header con filtros */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Personas</h2>
            <p className="text-gray-600">
              Gestiona la información de todas las personas registradas
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge 
              variant="primary"
              size="lg"
            >
              {personasFiltradas.length} {personasFiltradas.length === 1 ? 'persona' : 'personas'}
            </Badge>
            
            {onNuevaPersona && (
              <Button onClick={onNuevaPersona}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Persona
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              value={filtros.busqueda || ''}
              onChange={(e) => handleBusquedaChange(e.target.value)}
              fullWidth
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Select
              options={filtrosOptions}
              value={getCurrentFilter()}
              onChange={(e) => handleFiltroChange(e.target.value)}
              placeholder="Filtrar personas..."
              fullWidth
            />
            
            <Button
              variant="secondary"
              onClick={clearFiltros}
              disabled={!filtros.busqueda && filtros.conPrestamos === undefined}
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 mb-1">Total personas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalPersonas}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-blue-700 mb-1">Con préstamos</p>
                <p className="text-2xl font-bold text-blue-800">
                  {personasConPrestamos.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 mb-1">Sin préstamos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {personasSinPrestamos.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de personas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personasFiltradas.map(persona => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            onClick={onPersonaClick || (() => {})}
          />
        ))}
      </div>

      {/* Loading indicator para carga adicional */}
      {loading && personas.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default ListaPersonas;