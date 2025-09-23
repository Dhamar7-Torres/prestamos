import React from 'react';
import { useApp } from '@/context/AppContext';
import { usePrestamo } from '@/context/PrestamoContext';
import { classNames } from '@/utils/helpers';
import Navigation from './Navigation';
import { APP_CONFIG } from '@/utils/constants';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { sidebarOpen, setSidebar } = useApp();
  const { totalPendientes, totalCompletados } = usePrestamo();

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
      current: currentView === 'dashboard',
      onClick: () => {
        onViewChange('dashboard');
        setSidebar(false);
      }
    },
    {
      name: 'Préstamos Pendientes',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      current: currentView === 'pendientes',
      onClick: () => {
        onViewChange('pendientes');
        setSidebar(false);
      },
      badge: totalPendientes
    },
    {
      name: 'Préstamos Completados',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      current: currentView === 'completados',
      onClick: () => {
        onViewChange('completados');
        setSidebar(false);
      },
      badge: totalCompletados
    },
    {
      name: 'Personas',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      current: currentView === 'personas',
      onClick: () => {
        onViewChange('personas');
        setSidebar(false);
      }
    },
    {
      name: 'Estadísticas',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      current: currentView === 'estadisticas',
      onClick: () => {
        onViewChange('estadisticas');
        setSidebar(false);
      }
    }
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebar(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={classNames(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">
              Menú
            </h2>
            <button
              onClick={() => setSidebar(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <Navigation items={navigationItems} />
          </div>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>Versión {APP_CONFIG.VERSION}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;