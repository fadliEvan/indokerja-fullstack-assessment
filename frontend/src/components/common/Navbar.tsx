import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Building2, User as UserIcon, LogIn, LogOut, Menu, X, PlusCircle, FileText, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <Briefcase size={26} />
          <span>IndoKerja.id</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation links */}
        <nav>
          <ul className={`nav-links ${mobileMenuOpen ? 'nav-open' : ''}`}>
            {/* Public Links */}
            <li>
              <Link to="/jobs" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Search size={16} />
                <span>Lowongan</span>
              </Link>
            </li>

            {/* Guest Links */}
            {!user && (
              <>
                <li>
                  <Link to="/login" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <LogIn size={16} />
                    <span>Masuk</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    Daftar Akun
                  </Link>
                </li>
              </>
            )}

            {/* Job Seeker Links */}
            {user && user.role === 'JOB_SEEKER' && (
              <>
                <li>
                  <Link
                    to="/applications"
                    onClick={closeMenu}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <FileText size={16} />
                    <span>Lamaran Saya</span>
                  </Link>
                </li>
                <li>
                  <span className="user-pill">
                    <UserIcon size={14} />
                    <span>{user.fullName}</span>
                  </span>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                </li>
              </>
            )}

            {/* Company Links */}
            {user && user.role === 'COMPANY' && (
              <>
                <li>
                  <Link
                    to="/company/jobs"
                    onClick={closeMenu}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <Briefcase size={16} />
                    <span>Lowongan Saya</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/company/jobs/new"
                    onClick={closeMenu}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none' }}
                  >
                    <PlusCircle size={14} />
                    <span>Pasang Lowongan</span>
                  </Link>
                </li>
                <li>
                  <span className="user-pill">
                    <Building2 size={14} />
                    <span>{user.companyProfile?.companyName || user.fullName}</span>
                  </span>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};
