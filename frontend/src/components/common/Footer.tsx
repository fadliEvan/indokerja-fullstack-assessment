import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--gray-200)',
        backgroundColor: '#ffffff',
        padding: '1.75rem 0',
        textAlign: 'center',
        color: 'var(--gray-500)',
        fontSize: '0.875rem',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <p>
          &copy; {new Date().getFullYear()} <strong>IndoKerja.id</strong>. Sistem Manajemen Lowongan Kerja & Pelacakan Lamaran Terpercaya.
        </p>
      </div>
    </footer>
  );
};
