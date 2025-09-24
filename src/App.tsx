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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden p-8">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 space-y-6">
        {/* Header del Dashboard */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-light text-gray-900">Dashboard</h2>
          <p className="text-gray-700">Resumen general de tu gestión de préstamos</p>
        </div>

        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-700">Total Prestado</p>
                  <p className="text-2xl font-medium text-gray-900">
                    {formatCurrency(estadisticas.totales.montoTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-700">Total Recuperado</p>
                  <p className="text-2xl font-semibold text-emerald-600">
                    {formatCurrency(estadisticas.totales.montoPagado)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-700">Pendiente</p>
                  <p className="text-2xl font-semibold text-orange-600">
                    {formatCurrency(estadisticas.totales.montoRestante)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-700">Préstamos Activos</p>
                  <p className="text-2xl font-medium text-gray-900">
                    {estadisticas?.estados?.activos || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Préstamos por Estado</h3>
            {estadisticas && (
              <div className="space-y-3">
                <div className="flex justify-between bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3">
                  <span className="text-gray-700">Activos:</span>
                  <span className="font-semibold text-orange-600">{estadisticas.estados.activos}</span>
                </div>
                <div className="flex justify-between bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3">
                  <span className="text-gray-700">Completados:</span>
                  <span className="font-semibold text-emerald-600">{estadisticas.estados.completados}</span>
                </div>
                <div className="flex justify-between bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3">
                  <span className="text-gray-700">Vencidos:</span>
                  <span className="font-semibold text-red-600">{estadisticas.estados.vencidos}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button
                onClick={onNuevoPrestamo}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Crear Nuevo Préstamo</span>
                </div>
              </button>

              <button
                onClick={onVerPersonas}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Ver Todas las Personas</span>
                </div>
              </button>
            </div>
          </div>
        </div>
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
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden flex items-center justify-center">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-purple-500 relative overflow-hidden">
      {/* Efectos de fondo globales */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 to-blue-500/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>

      {/* Layout principal con flexbox */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar 
          currentView={vistaActual}
          onViewChange={setVistaActual}
        />

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <Header />

          {/* Main content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
              {/* Error handling */}
              {error && (
                <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <p className="text-red-700 font-medium">{error}</p>
                    <button
                      onClick={clearError}
                      className="p-2 hover:bg-white/20 rounded-xl text-red-600 hover:text-red-800 transition-all duration-200 ml-4"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Header de la vista - SOLO para vistas que NO son dashboard o personas */}
              {!mostrarFormularioNuevo && vistaActual !== 'detalle' && vistaActual !== 'dashboard' && vistaActual !== 'personas' && (
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-light text-gray-900">
                        Gestión de Préstamos
                      </h1>
                      <p className="text-gray-700 mt-1">
                        Controla y gestiona todos tus préstamos de manera eficiente
                      </p>
                    </div>
                    
                    <button
                      onClick={handleNuevoPrestamo}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg inline-flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Nuevo Préstamo
                    </button>
                  </div>
                </div>
              )}

              {/* Contenido dinámico */}
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
                <PersonasPage />
              ) : (
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-12 text-center">
                  <h2 className="text-2xl font-light text-gray-900 mb-4">
                    Vista en desarrollo
                  </h2>
                  <p className="text-gray-700">
                    Esta funcionalidad estará disponible próximamente
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
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