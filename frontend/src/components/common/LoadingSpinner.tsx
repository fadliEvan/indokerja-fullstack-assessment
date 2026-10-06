import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
  message?: string;
  isFullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  dark = false,
  message,
  isFullScreen = false
}) => {
  const spinnerElement = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '1.5rem'
      }}
    >
      <span className={`spinner spinner-${size} ${dark ? 'spinner-dark' : ''}`} />
      {message && <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{message}</p>}
    </div>
  );

  if (isFullScreen) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--gray-50)'
        }}
      >
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};
