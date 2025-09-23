import React from 'react';
import { APP_CONFIG } from '@/utils/constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-900 font-medium">
                {APP_CONFIG.NAME}
              </p>
              <p className="text-xs text-gray-500">
                {APP_CONFIG.DESCRIPTION}
              </p>
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Documentación
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Soporte
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Política de Privacidad
            </a>
          </div>

          {/* Right side */}
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-500">
              © {currentYear} {APP_CONFIG.NAME}. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Versión {APP_CONFIG.VERSION}
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Funcionalidades
              </h4>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>Gestión de Préstamos</li>
                <li>Registro de Pagos</li>
                <li>Reportes Detallados</li>
                <li>Recordatorios Automáticos</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Tecnologías
              </h4>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>React + TypeScript</li>
                <li>Node.js + Express</li>
                <li>PostgreSQL + Prisma</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Contacto
              </h4>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>soporte@prestamos.app</li>
                <li>+57 300 123 4567</li>
                <li>Colombia</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;