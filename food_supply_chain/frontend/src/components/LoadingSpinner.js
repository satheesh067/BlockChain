import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-green-600`}></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
