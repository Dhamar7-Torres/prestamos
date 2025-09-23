import React from 'react';
import { classNames } from '@/utils/helpers';

interface ErrorMessageProps {
  message?: string;
  title?: string;
  details?: string[];
  showIcon?: boolean;
  variant?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Ha ocurrido un error inesperado',
  title,
  details,
  showIcon = true,
  variant = 'error',
  onRetry,
  onDismiss,
  className
}) => {
  const variantClasses = {
    error: {
      container: 'bg-red-50 border-red-200',
      title: 'text-red-800',
      message: 'text-red-700',
      icon: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      container: 'bg-warning-50 border-warning-200',
      title: 'text-warning-800',
      message: 'text-warning-700',
      icon: 'text-warning-400',
      button: 'bg-warning-600 hover:bg-warning-700 text-white'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      title: 'text-blue-800',
      message: 'text-blue-700',
      icon: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const styles = variantClasses[variant];

  const getIcon = () => {
    switch (variant) {
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={classNames(
      'border rounded-lg p-4',
      styles.container,
      className
    )}>
      <div className="flex">
        {showIcon && (
          <div className={classNames('flex-shrink-0', styles.icon)}>
            {getIcon()}
          </div>
        )}
        
        <div className={classNames('ml-3 flex-1')}>
          {title && (
            <h3 className={classNames('text-sm font-medium', styles.title)}>
              {title}
            </h3>
          )}
          
          <div className={classNames('text-sm', styles.message, title && 'mt-1')}>
            <p>{message}</p>
            
            {details && details.length > 0 && (
              <ul className="mt-2 space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={classNames(
                    'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                    styles.button
                  )}
                >
                  Reintentar
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                >
                  Cerrar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;