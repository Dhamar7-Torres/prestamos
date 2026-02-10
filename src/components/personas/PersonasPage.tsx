import React, { useState } from 'react';
import ListaPersonas from '@/components/personas/ListaPersonas';
import { usePersona } from '@/context/PersonaContext';
import type { Personas } from '@/types';
import { Persona } from '@prisma/client';

// Extender el tipo Persona para incluir _count si es necesario
type PersonaConRelaciones = Persona & {
  _count?: {
    prestamos?: number;
  };
};

const PersonasPage: React.FC = () => {
  const [personaSeleccionada, setPersonaSeleccionada] = useState<PersonaConRelaciones | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const { cargarPersonas } = usePersona();

  const handlePersonaClick = (persona: Personas) => {
    console.log('Persona seleccionada:', persona);
    // ERROR CORREGIDO: Era "Personas" (tipo) ahora es "persona" (valor)
    setPersonaSeleccionada(persona as unknown as PersonaConRelaciones);
    // Aquí puedes agregar navegación o mostrar detalles de la persona  
    // Por ejemplo, mostrar los préstamos de esa persona
  };

  const handleNuevaPersona = () => {
    setMostrarFormulario(true);
    // Aquí puedes mostrar un formulario para crear nueva persona
    // o navegar a la página de crear persona
  };

  const handlePersonaCreada = async (persona: Persona) => {
    // Recargar la lista después de crear una persona
    await cargarPersonas();
    setMostrarFormulario(false);
    setPersonaSeleccionada(persona as PersonaConRelaciones);
  };

  // Si hay una persona seleccionada, podrías mostrar sus detalles
  if (personaSeleccionada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-light text-gray-900">
                Detalles de {personaSeleccionada.nombre} {personaSeleccionada.apellido}
              </h1>
              <button
                onClick={() => setPersonaSeleccionada(null)}
                className="p-2 hover:bg-white/20 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Volver a lista
              </button>
            </div>
          </div>
          
          {/* Información Personal */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                <label className="text-xs text-gray-700 mb-2 block">Nombre completo</label>
                <p className="text-sm font-medium text-gray-900">
                  {personaSeleccionada.nombre} {personaSeleccionada.apellido}
                </p>
              </div>
              
              {personaSeleccionada.telefono && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <label className="text-xs text-gray-700 mb-2 block">Teléfono</label>
                  <p className="text-sm font-medium text-gray-900">{personaSeleccionada.telefono}</p>
                </div>
              )}
              
              {personaSeleccionada.email && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <label className="text-xs text-gray-700 mb-2 block">Email</label>
                  <p className="text-sm font-medium text-gray-900">{personaSeleccionada.email}</p>
                </div>
              )}
              
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Estadísticas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <p className="text-xs text-gray-700 mb-1">Préstamos</p>
                  <p className="text-lg font-medium text-gray-900">
                    {/* ERROR CORREGIDO: Manejo seguro de _count */}
                    {personaSeleccionada._count?.prestamos ?? 0}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <p className="text-xs text-gray-700 mb-1">Registrado</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(personaSeleccionada.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <p className="text-xs text-gray-700 mb-1">Estado</p>
                  <p className="text-lg font-semibold text-emerald-600">Activo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar lista de personas por defecto
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-gray-900">Gestión de Personas</h1>
              <p className="text-gray-700">
                Administra la información de todas las personas registradas en el sistema
              </p>
            </div>
          </div>
        </div>

        <ListaPersonas
          onPersonaClick={handlePersonaClick}
          onNuevaPersona={handleNuevaPersona}
        />

        {/* Modal para crear nueva persona */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 max-w-md w-full mx-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Crear Nueva Persona</h2>
              <p className="text-gray-700 mb-4">
                Por el momento, las personas se crean automáticamente al crear un préstamo.
              </p>
              <div className="mb-6 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4">
                <p className="text-sm text-gray-900">
                  Próximamente: Formulario independiente para crear personas.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    // Aquí puedes navegar a crear préstamo
                    console.log('Navegar a crear préstamo');
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Crear Préstamo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonasPage;