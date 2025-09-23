import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import { PrestamoProvider } from '@/context/PrestamoContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import ListaPrestamos from '@/components/prestamos/ListaPrestamos';
import DetallePersona from '@/components/prestamos/DetallePersona';
import FormularioNuevoPrestamo from '@/components/prestamos/FormularioNuevoPrestamo';
import { usePrestamo } from '@/context/PrestamoContext';
import type { Prestamo } from '@/types';

const AppContent: React.FC = () => {
  const [vistaActual, setVistaActual] = useState<string>('pendientes');
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);

  const {
    prestamos,
    loading,
    error,
    cargarPrestamos,
    clearError
  } = usePrestamo();

  React.useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  const handlePrestamoClick = (prestamo: Prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setVistaActual('detalle');
  };

  const handlePrestamoActualizado = (prestamoActualizado: Prestamo) => {
    // El contexto ya maneja la actualización
    setPrestamoSeleccionado(prestamoActualizado);
  };

  const handleNuevoPrestamoExitoso = () => {
    setMostrarFormularioNuevo(false);
    cargarPrestamos();
  };

  const handleVolver = () => {
    setVistaActual('pendientes');
    setPrestamoSeleccionado(null);
  };

  if (loading && prestamos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando préstamos...</p>
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
            {!mostrarFormularioNuevo && vistaActual !== 'detalle' && (
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
                  onClick={() => setMostrarFormularioNuevo(true)}
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
                onCancel={() => setMostrarFormularioNuevo(false)}
              />
            ) : vistaActual === 'detalle' && prestamoSeleccionado ? (
              <DetallePersona
                prestamo={prestamoSeleccionado}
                onVolver={handleVolver}
                onActualizado={handlePrestamoActualizado}
              />
            ) : vistaActual === 'pendientes' ? (
              <ListaPrestamos
                prestamos={prestamos}
                titulo="Préstamos Pendientes"
                completado={false}
                onPrestamoClick={handlePrestamoClick}
                onNuevoPrestamo={() => setMostrarFormularioNuevo(true)}
              />
            ) : vistaActual === 'completados' ? (
              <ListaPrestamos
                prestamos={prestamos}
                titulo="Préstamos Completados"
                completado={true}
                onPrestamoClick={handlePrestamoClick}
              />
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
      
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <PrestamoProvider>
        <AppContent />
      </PrestamoProvider>
    </AppProvider>
  );
}

export default App;