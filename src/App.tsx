import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import { PrestamoProvider } from '@/context/PrestamoContext';
import { formatCurrency } from '@/utils/formatters';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ListaPrestamos from '@/components/prestamos/ListaPrestamos';
import DetallePersona from '@/components/prestamos/DetallePersona';
import FormularioNuevoPrestamo from '@/components/prestamos/FormularioNuevoPrestamo';
import PersonasPage from './components/personas/PersonasPage';
import { usePrestamo } from '@/context/PrestamoContext';
import apiService from '@/services/api';
import type { Prestamo } from '@/types';
import { PersonaProvider } from '@/context/PersonaContext';

// Propiedades para el componente Dashboard
interface DashboardProps {
  onNuevoPrestamo: () => void;
  onVerPersonas: () => void;
}

// Componente Dashboard
const Dashboard: React.FC<DashboardProps> = ({ onNuevoPrestamo, onVerPersonas }) => {
  const { estadisticas } = usePrestamo();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Resumen general de tu gestión de préstamos</p>
      </div>

      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Prestado</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(estadisticas.totales.montoTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Recuperado</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(estadisticas.totales.montoPagado)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendiente</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(estadisticas.totales.montoRestante)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Préstamos Activos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {estadisticas?.estados?.activos || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Préstamos por Estado</h3>
          {estadisticas && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Activos:</span>
                <span className="font-medium text-warning-600">{estadisticas.estados.activos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completados:</span>
                <span className="font-medium text-success-600">{estadisticas.estados.completados}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vencidos:</span>
                <span className="font-medium text-red-600">{estadisticas.estados.vencidos}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={onNuevoPrestamo}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">Crear Nuevo Préstamo</span>
              </div>
            </button>

            <button
              onClick={onVerPersonas}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span className="font-medium">Ver Todas las Personas</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Vista Personas
const VistaPersonas: React.FC = () => {
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const cargarPersonas = async () => {
      try {
        setLoading(true);
        const response = await apiService.obtenerPersonas({ limit: 100 });
        setPersonas(response.data.data || []);
      } catch (error) {
        console.error('Error cargando personas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarPersonas();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando personas...</p>
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-500 mb-2">No hay personas registradas</h3>
        <p className="text-gray-400">Las personas aparecerán aquí cuando crees préstamos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Personas</h2>
        <div className="text-sm text-gray-500">
          Total: {personas.length} personas registradas
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map(persona => (
          <div key={persona.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-lg">
                  {persona.nombre.charAt(0)}{persona.apellido?.charAt(0) || ''}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {persona.nombre} {persona.apellido || ''}
                </h3>
                {persona.telefono && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {persona.telefono}
                  </p>
                )}
                {persona.email && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {persona.email}
                  </p>
                )}
              </div>
            </div>
            
            {persona._count && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{persona._count.prestamos}</span> préstamos registrados
                </p>
              </div>
            )}

            <div className="mt-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                persona.activo 
                  ? 'bg-success-100 text-success-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {persona.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [vistaActual, setVistaActual] = useState<string>('dashboard');
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);

  const {
    prestamos,
    loading,
    error,
    cargarPrestamos,
    cargarEstadisticas,
    clearError
  } = usePrestamo();

  // Cargar datos solo una vez al montar
  React.useEffect(() => {
    cargarPrestamos();
    cargarEstadisticas();
  }, []); // Sin dependencias para evitar bucle

  const handlePrestamoClick = (prestamo: Prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setVistaActual('detalle');
  };

  const handlePrestamoActualizado = (prestamoActualizado: Prestamo) => {
    setPrestamoSeleccionado(prestamoActualizado);
    
    // Recargar la lista para reflejar cambios (ej: movimiento a completados)
    setTimeout(() => {
      cargarPrestamos();
    }, 500);
  };

  const handleNuevoPrestamoExitoso = () => {
    setMostrarFormularioNuevo(false);
    setVistaActual('pendientes');
    
    // Recargar datos después de crear
    setTimeout(() => {
      cargarPrestamos();
      cargarEstadisticas();
    }, 500);
  };

  const handleVolver = () => {
    const prestamoActual = prestamoSeleccionado;
    setVistaActual(prestamoActual?.completado ? 'completados' : 'pendientes');
    setPrestamoSeleccionado(null);
  };

  // Función para manejar nuevo préstamo desde Dashboard
  const handleNuevoPrestamo = () => {
    setMostrarFormularioNuevo(true);
    setVistaActual('nuevo');
  };

  // Función para ver personas desde Dashboard
  const handleVerPersonas = () => {
    setVistaActual('personas');
  };

  if (loading && prestamos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar 
          currentView={vistaActual}
          onViewChange={setVistaActual}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-start">
                  <p className="text-red-800">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Header de la vista */}
            {!mostrarFormularioNuevo && vistaActual !== 'detalle' && vistaActual !== 'dashboard' && (
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gestión de Préstamos
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Controla y gestiona todos tus préstamos de manera eficiente
                  </p>
                </div>
                
                <button
                  onClick={handleNuevoPrestamo}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nuevo Préstamo
                </button>
              </div>
            )}

            {/* Contenido principal */}
            {mostrarFormularioNuevo ? (
              <FormularioNuevoPrestamo
                onSuccess={handleNuevoPrestamoExitoso}
                onCancel={() => {
                  setMostrarFormularioNuevo(false);
                  setVistaActual('dashboard');
                }}
              />
            ) : vistaActual === 'detalle' && prestamoSeleccionado ? (
              <DetallePersona
                prestamo={prestamoSeleccionado}
                onVolver={handleVolver}
                onActualizado={handlePrestamoActualizado}
              />
            ) : vistaActual === 'dashboard' ? (
              <Dashboard 
                onNuevoPrestamo={handleNuevoPrestamo}
                onVerPersonas={handleVerPersonas}
              />
            ) : vistaActual === 'pendientes' ? (
              <ListaPrestamos
                prestamos={prestamos}
                titulo="Préstamos Pendientes"
                completado={false}
                onPrestamoClick={handlePrestamoClick}
                onNuevoPrestamo={handleNuevoPrestamo}
              />
            ) : vistaActual === 'completados' ? (
              <ListaPrestamos
                prestamos={prestamos}
                titulo="Préstamos Completados"
                completado={true}
                onPrestamoClick={handlePrestamoClick}
              />
            ) : vistaActual === 'personas' ? (
              <VistaPersonas />
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Vista en desarrollo
                </h2>
                <p className="text-gray-600">
                  Esta funcionalidad estará disponible próximamente
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <PrestamoProvider>
        <PersonaProvider>
          <AppContent />
        </PersonaProvider>
      </PrestamoProvider>
    </AppProvider>
  );
}

export default App;