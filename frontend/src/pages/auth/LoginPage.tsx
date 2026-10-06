import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { ApiError } from '../../services/apiClient';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read return path from location state if available
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({
        email: email.trim(),
        password
      });

      // Role-based navigation
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'COMPANY') {
        navigate('/company/jobs', { replace: true });
      } else {
        navigate('/jobs', { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setServerError('Email atau password yang Anda masukkan salah.');
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('Terjadi kesalahan saat masuk. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setErrors({});
    setServerError(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem 1rem',
        minHeight: 'calc(100vh - 4.25rem - 70px)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--gray-900)' }}>Selamat Datang Kembali</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
            Masuk ke akun IndoKerja.id Anda
          </p>
        </div>

        <Card padding="lg">
          {serverError && (
            <Alert variant="error" onClose={() => setServerError(null)}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Alamat Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isFullWidth
              isLoading={isSubmitting}
              leftIcon={<LogIn size={18} />}
              style={{ marginTop: '0.5rem' }}
            >
              Masuk ke Akun
            </Button>
          </form>

          {/* Quick Demo Credentials for Reviewers */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--gray-200)',
              fontSize: '0.8125rem',
              color: 'var(--gray-500)'
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
              Akun Uji Coba Cepat:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fillDemo('seeker@indokerja.id')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                <Mail size={12} /> Seeker (Budi Santoso)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('company@indokerja.id')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                <Lock size={12} /> Company (PT Teknologi Nusantara)
              </button>
            </div>
          </div>
        </Card>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};
