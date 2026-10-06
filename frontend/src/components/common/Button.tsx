import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...rest
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'md' ? '' : `btn-${size}`;
  const blockClass = isFullWidth ? 'btn-block' : '';
  const disabledClass = disabled || isLoading ? 'btn-disabled' : '';

  const combinedClassName = ['btn', variantClass, sizeClass, blockClass, disabledClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={combinedClassName} disabled={disabled || isLoading} {...rest}>
      {isLoading ? (
        <>
          <span className={`spinner spinner-sm ${variant === 'secondary' || variant === 'outline' ? 'spinner-dark' : ''}`} />
          <span>Memuat...</span>
        </>
      ) : (
        <>
          {leftIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>}
          {children}
          {rightIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
