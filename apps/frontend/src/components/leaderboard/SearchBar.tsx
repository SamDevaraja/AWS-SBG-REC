import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  delayMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search Enthusiast...',
  delayMs = 400,
}) => {
  const [value, setValue] = useState('');
  const isFirstRender = useRef(true);

  // Debounced search logic
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearch(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, onSearch, delayMs]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="w-full relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        {/* Search Magnifying Glass Icon */}
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="text"
        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-aws-orange focus:ring-1 focus:ring-aws-orange transition-all duration-200"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-350 transition-colors"
          title="Clear search"
        >
          {/* X Close Icon */}
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
export default SearchBar;
