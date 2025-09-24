import React from 'react';
import { useApp } from '@/context/AppContext';
import { APP_CONFIG } from '@/utils/constants';
import Button from '@/components/common/Button';
import SearchInput from '@/components/common/SearchInput';

const Header: React.FC = () => {
  const { 
    toggleSidebar, 
    setSearchTerm, 
    online,
    notifications 
  } = useApp();

  const unreadNotifications = notifications.filter(n => !n.id).length;

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {/* Menu button for mobile */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-white/20 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo y título - Solo en móvil */}
            <div className="flex items-center space-x-3 lg:hidden">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="sm:block">
                <h1 className="text-xl font-medium text-gray-900">
                  {APP_CONFIG.NAME}
                </h1>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar personas, préstamos..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/30 backdrop-blur-sm border border-white/50 rounded-xl text-gray-900 placeholder-gray-600 focus:ring-emerald-500 focus:border-transparent py-2 px-4 pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection status */}
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-700 hidden sm:inline font-medium">
                {online ? 'Conectado' : 'Sin conexión'}
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-white/20 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5-5V9.5a3.5 3.5 0 10-7 0V12l-5 5h5a3 3 0 006 0z" />
              </svg>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm text-gray-700 hidden sm:inline font-medium">
                Usuario Demo
              </span>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-4 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/30 backdrop-blur-sm border border-white/50 rounded-xl text-gray-900 placeholder-gray-600 focus:ring-emerald-500 focus:border-transparent py-2 px-4 pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;