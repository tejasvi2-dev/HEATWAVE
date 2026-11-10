import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorDisplay = ({ message = 'An error occurred loading thermal data.', onRetry }) => {
  return (
    <div className="bg-red-950/20 border border-red-500/40 rounded-xl p-6 text-center space-y-3">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
      <h4 className="text-sm font-bold text-red-300">Data Stream Interruption</h4>
      <p className="text-xs text-gray-400 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/50 text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
