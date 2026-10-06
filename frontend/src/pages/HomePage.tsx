import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, var(--gray-50) 100%)',
          borderBottom: '1px solid var(--gray-200)',
          padding: '4.5rem 1rem 4rem 1rem',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '800px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1.25rem'
            }}
          >
            Portal Karir & Rekrutmen Modern #1 di Indonesia
          </span>
          <h1
            style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              color: 'var(--gray-900)',
              lineHeight: 1.2,
              marginBottom: '1.25rem'
            }}
          >
            Temukan Karir Impianmu di{' '}
            <span style={{ color: 'var(--primary-600)' }}>IndoKerja.id</span>
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--gray-600)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '640px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            Hubungkan talenta terbaik dengan ribuan peluang karir terpercaya. Pantau tahapan seleksi
            secara langsung dan transparan dari awal hingga akhir.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Link to="/jobs">
              <Button variant="primary" size="lg" leftIcon={<Search size={18} />}>
                Jelajahi Lowongan
              </Button>
            </Link>

            {!user && (
              <Link to="/register">
                <Button variant="secondary" size="lg" rightIcon={<ArrowRight size={18} />}>
                  Daftar Akun Baru
                </Button>
              </Link>
            )}

            {user && user.role === 'JOB_SEEKER' && (
              <Link to="/applications">
                <Button variant="secondary" size="lg" leftIcon={<Briefcase size={18} />}>
                  Lihat Lamaran Saya
                </Button>
              </Link>
            )}

            {user && user.role === 'COMPANY' && (
              <Link to="/company/jobs">
                <Button variant="secondary" size="lg" leftIcon={<Building2 size={18} />}>
                  Kelola Lowongan Perusahaan
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="container" style={{ padding: '3.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--gray-900)' }}>Keunggulan Platform</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            Dirancang untuk kenyamanan pencari kerja dan efisiensi tim rekrutmen perusahaan
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          <Card>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Briefcase size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
              Transparansi Status Lamaran
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
              Pantau perjalanan lamaran mulai dari Terkirim, Ditinjau, Lolos Seleksi, hingga Diterima dengan riwayat status yang jelas.
            </p>
          </Card>

          <Card>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
              Anti Duplikasi Lamaran
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
              Sistem mencegah pengiriman lamaran ganda pada lowongan yang sama untuk memastikan integritas data seleksi.
            </p>
          </Card>

          <Card>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Building2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
              Manajemen Kandidat Terpadu
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
              Perusahaan dapat mempublikasikan lowongan dan memperbarui tahapan kandidat secara terpusat dan aman.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};
