import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Building2 } from 'lucide-react';
import { Role } from '../../types/auth.types';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { ApiError } from '../../services/apiClient';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  companyName?: string;
}

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('JOB_SEEKER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Nama lengkap minimal 2 karakter';
    }

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (role === 'COMPANY' && (!companyName.trim() || companyName.trim().length < 2)) {
      newErrors.companyName = 'Nama perusahaan wajib diisi (min 2 karakter)';
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
      const user = await register({
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        companyName: role === 'COMPANY' ? companyName.trim() : undefined,
        industry: role === 'COMPANY' && industry.trim() ? industry.trim() : undefined,
        location: role === 'COMPANY' && location.trim() ? location.trim() : undefined
      });

      if (user.role === 'COMPANY') {
        navigate('/company/jobs', { replace: true });
      } else {
        navigate('/jobs', { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setServerError('Alamat email sudah terdaftar. Silakan gunakan email lain atau masuk.');
        } else if (err.status === 400 && err.details) {
          // Check for detailed field errors
          const details = err.details as Array<{ field?: string; message: string }>;
          if (Array.isArray(details) && details.length > 0) {
            const mapped: FormErrors = {};
            details.forEach((d) => {
              if (d.field === 'email') mapped.email = d.message;
              if (d.field === 'password') mapped.password = d.message;
              if (d.field === 'fullName') mapped.fullName = d.message;
              if (d.field === 'companyName') mapped.companyName = d.message;
            });
            setErrors(mapped);
          }
          setServerError(err.message);
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('Pendaftaran gagal. Silakan coba kembali.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--gray-900)' }}>Buat Akun Baru</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
            Pilih jenis akun dan daftarkan diri Anda di IndoKerja.id
          </p>
        </div>

        <Card padding="lg">
          {/* Role Selection Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              backgroundColor: 'var(--gray-100)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRole('JOB_SEEKER');
                setErrors({});
              }}
              className={`btn btn-sm ${role === 'JOB_SEEKER' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                boxShadow: role === 'JOB_SEEKER' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <User size={16} />
              <span>Pencari Kerja</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('COMPANY');
                setErrors({});
              }}
              className={`btn btn-sm ${role === 'COMPANY' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                boxShadow: role === 'COMPANY' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Building2 size={16} />
              <span>Perusahaan</span>
            </button>
          </div>

          {serverError && (
            <Alert variant="error" onClose={() => setServerError(null)}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Contoh: Budi Santoso"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              required
              autoComplete="name"
            />

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
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              helperText="Gunakan minimal 8 karakter"
              required
              autoComplete="new-password"
            />

            <Input
              label="Nomor Telepon (Opsional)"
              type="tel"
              placeholder="08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />

            {/* Company-specific fields */}
            {role === 'COMPANY' && (
              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--gray-200)'
                }}
              >
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '1rem', color: 'var(--gray-800)' }}>
                  Informasi Perusahaan
                </h4>

                <Input
                  label="Nama Perusahaan"
                  type="text"
                  placeholder="Contoh: PT Teknologi Maju"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  error={errors.companyName}
                  required
                />

                <Input
                  label="Industri (Opsional)"
                  type="text"
                  placeholder="Contoh: Teknologi Informasi / Finansial"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />

                <Input
                  label="Lokasi Kantor (Opsional)"
                  type="text"
                  placeholder="Contoh: Jakarta Selatan"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isFullWidth
              isLoading={isSubmitting}
              leftIcon={<UserPlus size={18} />}
              style={{ marginTop: '1rem' }}
            >
              {role === 'COMPANY' ? 'Daftar Sebagai Perusahaan' : 'Daftar Sebagai Pencari Kerja'}
            </Button>
          </form>
        </Card>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};
