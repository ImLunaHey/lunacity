import React from 'react';
import { Text } from '@nextui-org/react';

const ErrorComponent: React.FC<{ statusCode: number; message: string }> = ({
  message,
}) => {
  return (
    <div
      className="relative rounded border border-red-500 bg-red-500 px-4 py-3 text-white"
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
    </div>
  );
  //   return <Text color="error">{message}</Text>;
};

export default ErrorComponent;
