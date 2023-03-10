import React from 'react';

const ErrorComponent: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="relative rounded border border-red-500 bg-red-500 px-4 py-3 text-white" role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorComponent;
