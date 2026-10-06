import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = ''
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'error':
        return <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />;
      case 'success':
        return <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />;
      case 'warning':
        return <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />;
      case 'info':
      default:
        return <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />;
    }
  };

  return (
    <div className={`alert alert-${variant} ${className}`} role="alert">
      {getIcon()}
      <div style={{ flex: 1 }}>
        {title && <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{title}</strong>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            opacity: 0.7,
            cursor: 'pointer',
            padding: '2px',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
