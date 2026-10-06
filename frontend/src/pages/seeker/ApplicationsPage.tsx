import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, MapPin, Calendar, ArrowRight, Search } from 'lucide-react';
import { Application } from '../../types/application.types';
import { applicationApi } from '../../services/applicationApi';
import { PageContainer } from '../../components/common/PageContainer';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await applicationApi.getMyApplications();
      setApplications(data);
    } catch {
      setError('Gagal memuat daftar lamaran Anda. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <PageContainer
      title="Lamaran Pekerjaan Saya"
      subtitle="Pantau status dan tahapan seleksi lamaran yang telah Anda kirimkan"
      action={
        <Link to="/jobs">
          <Button variant="outline" size="sm" leftIcon={<Search size={15} />}>
            Cari Lowongan Lainnya
          </Button>
        </Link>
      }
    >
      {isLoading && (
        <LoadingSpinner message="Memuat riwayat lamaran Anda..." />
      )}

      {!isLoading && error && (
        <Alert variant="error" title="Gagal Memuat Data">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
            style={{ marginTop: '0.75rem' }}
          >
            Coba Lagi
          </Button>
        </Alert>
      )}

      {!isLoading && !error && applications.length === 0 && (
        <EmptyState
          icon={<Briefcase size={48} color="var(--primary-600)" />}
          title="Belum ada lamaran yang dikirim"
          description="Anda belum pernah mengajukan lamaran ke lowongan pekerjaan manapun. Temukan posisi impian Anda sekarang!"
          action={
            <Link to="/jobs">
              <Button variant="primary" leftIcon={<Search size={16} />}>
                Jelajahi Lowongan Kerja
              </Button>
            </Link>
          }
        />
      )}

      {!isLoading && !error && applications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9375rem', fontWeight: 600 }}>
            Total {applications.length} lamaran aktif
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((app) => (
              <Card key={app.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                        <Link to={`/applications/${app.id}`} style={{ color: 'inherit' }}>
                          {app.job.title}
                        </Link>
                      </h3>
                      {app.job.jobType && <StatusBadge status={app.job.jobType} size="sm" />}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
                      <Building2 size={16} />
                      <span>{app.job.company.companyName}</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                      {app.job.location && (
                        <span className="meta-tag">
                          <MapPin size={15} color="var(--gray-400)" />
                          <span>{app.job.location}</span>
                        </span>
                      )}
                      <span className="meta-tag">
                        <Calendar size={15} color="var(--gray-400)" />
                        <span>Melamar pada {formatDate(app.createdAt)}</span>
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '1rem',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', textAlign: 'right', marginBottom: '0.25rem' }}>
                        Status Lamaran
                      </span>
                      <StatusBadge status={app.status} />
                    </div>

                    <Link
                      to={`/applications/${app.id}`}
                      className="btn btn-outline btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                      <span>Lihat Riwayat Status</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
};
