import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Users,
  MapPin,
  Calendar,
  Eye,
  Banknote
} from 'lucide-react';
import { CompanyJobVacancy } from '../../types/company.types';
import { companyApi } from '../../services/companyApi';
import { PageContainer } from '../../components/common/PageContainer';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { formatDate, formatSalary } from '../../utils/formatters';

export const CompanyJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<CompanyJobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await companyApi.getCompanyJobs();
      setJobs(data);
    } catch {
      setError('Gagal memuat lowongan perusahaan Anda. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

  return (
    <PageContainer
      title="Manajemen Lowongan Perusahaan"
      subtitle="Kelola lowongan aktif dan pantau pelamar kerja untuk perusahaan Anda"
      action={
        <Link to="/company/jobs/new">
          <Button variant="primary" size="md" leftIcon={<PlusCircle size={16} />}>
            Pasang Lowongan Baru
          </Button>
        </Link>
      }
    >
      {/* Metric Summary Bar */}
      {!isLoading && !error && jobs.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div className="stat-card">
            <div className="stat-icon">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="stat-val">{jobs.length}</div>
              <div className="stat-label">Total Lowongan Aktif</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <Users size={22} />
            </div>
            <div>
              <div className="stat-val">{totalApplicants}</div>
              <div className="stat-label">Total Pelamar Terdaftar</div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <LoadingSpinner message="Memuat lowongan perusahaan..." />
      )}

      {!isLoading && error && (
        <Alert variant="error" title="Gagal Memuat Lowongan">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCompanyJobs}
            style={{ marginTop: '0.75rem' }}
          >
            Coba Lagi
          </Button>
        </Alert>
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <EmptyState
          icon={<Briefcase size={48} color="var(--primary-600)" />}
          title="Belum ada lowongan pekerjaan"
          description="Perusahaan Anda belum mempublikasikan lowongan pekerjaan. Pasang lowongan pertama Anda sekarang untuk mulai menerima lamaran."
          action={
            <Link to="/company/jobs/new">
              <Button variant="primary" leftIcon={<PlusCircle size={16} />}>
                Pasang Lowongan Pertama
              </Button>
            </Link>
          }
        />
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map((job) => (
            <Card key={job.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1.25rem'
                }}
              >
                {/* Job Metadata Column */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                      <Link to={`/company/jobs/${job.id}/candidates`} style={{ color: 'inherit' }}>
                        {job.title}
                      </Link>
                    </h3>
                    <StatusBadge status={job.jobType} size="sm" />
                    <StatusBadge status={job.status} size="sm" />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', margin: '0.75rem 0' }}>
                    <span className="meta-tag">
                      <MapPin size={15} color="var(--primary-600)" />
                      <span>{job.location}</span>
                    </span>
                    <span className="meta-tag">
                      <Banknote size={15} color="#059669" />
                      <span style={{ fontWeight: 600, color: '#059669' }}>
                        {formatSalary(job.salaryMin, job.salaryMax, job.isNegotiable)}
                      </span>
                    </span>
                    <span className="meta-tag">
                      <Calendar size={15} color="var(--gray-400)" />
                      <span>Dipasang {formatDate(job.createdAt)}</span>
                    </span>
                  </div>

                  <p
                    style={{
                      color: 'var(--gray-600)',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {job.description}
                  </p>
                </div>

                {/* Right Action Column */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.875rem',
                    justifyContent: 'center',
                    minWidth: '200px'
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.375rem 0.875rem',
                      backgroundColor: job.applicantCount > 0 ? 'var(--primary-50)' : 'var(--gray-100)',
                      color: job.applicantCount > 0 ? 'var(--primary-700)' : 'var(--gray-600)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}
                  >
                    <Users size={16} />
                    <span>{job.applicantCount} Pelamar</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'flex-end' }}>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="btn btn-secondary btn-sm"
                      title="Lihat Tampilan Publik"
                    >
                      <Eye size={14} />
                    </Link>

                    <Link
                      to={`/company/jobs/${job.id}/candidates`}
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                      <Users size={14} />
                      <span>Kelola Pelamar ({job.applicantCount})</span>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
