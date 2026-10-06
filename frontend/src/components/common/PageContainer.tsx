import React, { ReactNode } from 'react';

export interface PageContainerProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  action,
  children,
  className = ''
}) => {
  return (
    <div className={`container main-content ${className}`}>
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            {title && <h1 style={{ fontSize: '1.75rem', color: 'var(--gray-900)' }}>{title}</h1>}
            {subtitle && <p style={{ marginTop: '0.25rem', color: 'var(--gray-500)', fontSize: '0.9375rem' }}>{subtitle}</p>}
          </div>
          {action && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
