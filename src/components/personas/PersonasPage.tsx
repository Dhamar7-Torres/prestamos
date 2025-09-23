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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Detalles de {personaSeleccionada.nombre} {personaSeleccionada.apellido}
          </h1>
          <button
            onClick={() => setPersonaSeleccionada(null)}
            className="text-primary-600 hover:text-primary-800"
          >
            ← Volver a lista
          </button>
        </div>
        
        {/* Aquí puedes agregar un componente DetallePersona similar al que tienes para préstamos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
              <p className="mt-1 text-sm text-gray-900">
                {personaSeleccionada.nombre} {personaSeleccionada.apellido}
              </p>
            </div>
            
            {personaSeleccionada.telefono && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <p className="mt-1 text-sm text-gray-900">{personaSeleccionada.telefono}</p>
              </div>
            )}
            
            {personaSeleccionada.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{personaSeleccionada.email}</p>
              </div>
            )}
            
            {personaSeleccionada.direccion && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <p className="mt-1 text-sm text-gray-900">{personaSeleccionada.direccion}</p>
              </div>
            )}
            
            {personaSeleccionada.notas && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <p className="mt-1 text-sm text-gray-900">{personaSeleccionada.notas}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Estadísticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Préstamos</p>
                <p className="text-lg font-semibold text-gray-900">
                  {/* ERROR CORREGIDO: Manejo seguro de _count */}
                  {personaSeleccionada._count?.prestamos ?? 0}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">Registrado</p>
                <p className="text-lg font-semibold text-blue-900">
                  {new Date(personaSeleccionada.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-700">Estado</p>
                <p className="text-lg font-semibold text-green-900">Activo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar lista de personas por defecto
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Personas</h1>
          <p className="text-gray-600">
            Administra la información de todas las personas registradas en el sistema
          </p>
        </div>
      </div>

      <ListaPersonas
        onPersonaClick={handlePersonaClick}
        onNuevaPersona={handleNuevaPersona}
      />

      {/* Aquí puedes agregar un modal o formulario para crear nueva persona si mostrarFormulario es true */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Crear Nueva Persona</h2>
            <p className="text-gray-600 mb-4">
              Por el momento, las personas se crean automáticamente al crear un préstamo.
            </p>
            <p className="text-sm text-blue-600 mb-4">
              Próximamente: Formulario independiente para crear personas.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  // Aquí puedes navegar a crear préstamo
                  console.log('Navegar a crear préstamo');
                }}
                className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Crear Préstamo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonasPage;