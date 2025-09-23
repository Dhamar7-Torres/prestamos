import React, { useState, useEffect } from 'react';
import { debounce } from '@/utils/helpers';
import Input from './Input';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  delay?: number;
  className?: string;
  fullWidth?: boolean;
  clearable?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Buscar...',
  onSearch,
  delay = 300,
  className,
  fullWidth = false,
  clearable = true
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Debounced search function
  const debouncedSearch = debounce((term: string) => {
    onSearch(term);
  }, delay);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const searchIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const clearIcon = clearable && searchTerm && (
    <button
      onClick={handleClear}
      className="text-gray-400 hover:text-gray-600 transition-colors"
      type="button"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      leftIcon={searchIcon}
      rightIcon={clearIcon}
      fullWidth={fullWidth}
      className={className}
    />
  );
};

export default SearchInput;