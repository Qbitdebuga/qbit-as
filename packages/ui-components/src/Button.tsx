import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  onClick,
  children,
  disabled = false,
}) => {
  // Base classes
  let className = 'font-medium rounded focus:outline-none';
  
  // Size classes
  if (size === 'small') {
    className += ' px-3 py-1 text-sm';
  } else if (size === 'medium') {
    className += ' px-4 py-2';
  } else {
    className += ' px-6 py-3 text-lg';
  }
  
  // Variant classes
  if (variant === 'primary') {
    className += ' bg-blue-600 hover:bg-blue-700 text-white';
  } else if (variant === 'secondary') {
    className += ' bg-gray-200 hover:bg-gray-300 text-gray-800';
  } else {
    className += ' bg-transparent hover:bg-gray-100 text-gray-800';
  }
  
  if (disabled) {
    className += ' opacity-50 cursor-not-allowed';
  }
  
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}; 