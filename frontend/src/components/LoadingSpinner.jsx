import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading biometeorological observations...' }) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-5 h-5 border-2';
      case 'lg': return 'w-12 h-12 border-4';
      default: return 'w-8 h-8 border-2';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className={`${getSize()} border-orange-500/30 border-t-orange-500 rounded-full animate-spin`} />
      {message && <p className="text-xs text-gray-400 font-medium tracking-wide">{message}</p>}
    </div>
  );
};
