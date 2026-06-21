import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-3">
      {/* 6 Shimmering Table Rows */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="w-full grid grid-cols-[75px_1fr_125px] items-center py-3 px-6 border-b border-gray-100 bg-white relative overflow-hidden"
        >
          {/* Column 1: Rank */}
          <div className="w-8 h-4 bg-gray-200 rounded relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>

          {/* Column 2: Name */}
          <div className="w-32 h-4 bg-gray-200 rounded relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>

          {/* Column 3: Cloud Credits */}
          <div className="justify-self-start w-24 h-4 bg-gray-200 rounded relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>
        </div>
      ))}
    </div>
  );
};
export default LoadingSkeleton;
