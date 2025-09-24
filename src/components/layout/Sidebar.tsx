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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
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
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebar(false)}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Sidebar */}
      <div className={classNames(
        // Glassmorphism sidebar
        'w-64 bg-white/10 backdrop-blur-md border-r border-white/20',
        'fixed inset-y-0 left-0 z-50 lg:relative lg:z-0',
        'transform transition-transform duration-300 ease-in-out lg:transform-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar - Solo visible en móvil */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/20 lg:hidden">
            <h2 className="text-lg font-medium text-gray-900">
              Menú
            </h2>
            <button
              onClick={() => setSidebar(false)}
              className="p-2 hover:bg-white/20 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Logo en desktop */}
          <div className="hidden lg:flex items-center h-16 px-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h1 className="text-lg font-medium text-gray-900">
                {APP_CONFIG.NAME}
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={classNames(
                    'w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    item.current
                      ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-gray-900'
                      : 'text-gray-700 hover:bg-white/10 hover:text-gray-900'
                  )}
                >
                  <span className="w-5 h-5 mr-3 flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge !== undefined && (
                    <span className="text-xs px-2 py-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-gray-700 transition-all duration-200 border border-white/30 ml-2">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-white/20">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3">
              <div className="text-xs text-gray-700 text-center">
                <p className="font-medium text-gray-900">{APP_CONFIG.NAME}</p>
                <p>Versión {APP_CONFIG.VERSION}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;