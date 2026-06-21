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
  const [isFocused, setIsFocused] = useState(false);
  const isFirstRender = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        {/* Search Magnifying Glass Icon */}
        <svg
          className={`h-4 w-4 transition-colors duration-200 ${
            isFocused ? 'text-amber-500' : 'text-slate-400'
          }`}
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
        ref={inputRef}
        type="text"
        className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 hover:bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400/80 transition-all duration-200 focus:bg-white focus:outline-none ${
          isFocused
            ? 'border-amber-500 ring-2 ring-amber-500/10'
            : 'border-slate-200/80 hover:border-slate-350'
        }`}
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => setValue(e.target.value)}
      />

      {value ? (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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
      ) : (
        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[10px] font-bold text-slate-400/70 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-[0_1px_1px_rgba(0,0,0,0.03)] select-none">
          /
        </span>
      )}
    </div>
  );
};
export default SearchBar;
