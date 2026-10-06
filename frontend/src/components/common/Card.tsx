import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  className = '',
  style,
  ...rest
}) => {
  const paddingStyles: Record<string, string> = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem'
  };

  return (
    <div
      className={`card ${className}`}
      style={{
        padding: paddingStyles[padding],
        ...style
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
