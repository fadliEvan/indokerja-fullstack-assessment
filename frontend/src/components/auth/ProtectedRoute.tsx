import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Role } from '../../types/auth.types';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner isFullScreen message="Memeriksa sesi login..." />;
  }

  if (!user) {
    // Unauthenticated user is redirected to /login preserving the intended target URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role mismatch: redirect to their respective primary dashboard
    if (user.role === 'COMPANY') {
      return <Navigate to="/company/jobs" replace />;
    }
    return <Navigate to="/applications" replace />;
  }

  return <>{children}</>;
};

/**
 * Route guard that redirects already-authenticated users away from auth pages (login/register)
 */
export const GuestRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner isFullScreen message="Memeriksa sesi..." />;
  }

  if (user) {
    if (user.role === 'COMPANY') {
      return <Navigate to="/company/jobs" replace />;
    }
    return <Navigate to="/jobs" replace />;
  }

  return <>{children}</>;
};
