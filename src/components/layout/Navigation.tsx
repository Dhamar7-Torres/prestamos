import React from 'react';
import { classNames } from '@/utils/helpers';

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  current: boolean;
  onClick: () => void;
  badge?: number;
}

interface NavigationProps {
  items: NavigationItem[];
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ items, className }) => {
  return (
    <nav className={classNames('space-y-1', className)}>
      {items.map((item) => (
        <button
          key={item.name}
          onClick={item.onClick}
          className={classNames(
            'group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
            item.current
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <div className={classNames(
            'mr-3 flex-shrink-0 h-5 w-5',
            item.current
              ? 'text-primary-500'
              : 'text-gray-400 group-hover:text-gray-500'
          )}>
            {item.icon}
          </div>
          
          <span className="flex-1 text-left">
            {item.name}
          </span>
          
          {item.badge && item.badge > 0 && (
            <span className={classNames(
              'ml-3 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium',
              item.current
                ? 'bg-primary-200 text-primary-800'
                : 'bg-gray-200 text-gray-800'
            )}>
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;