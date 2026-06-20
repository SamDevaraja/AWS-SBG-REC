import React from 'react';

interface EmptyStateProps {
  message?: string;
  onClearSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No learners match your search.',
  onClearSearch,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-gray-100">
      <p className="text-sm text-gray-400 font-medium">{message}</p>
      {onClearSearch && (
        <button
          onClick={onClearSearch}
          className="mt-4 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-all duration-200"
        >
          Clear Search
        </button>
      )}
    </div>
  );
};
export default EmptyState;
