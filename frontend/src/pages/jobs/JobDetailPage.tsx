import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Banknote,
  Calendar,
  ArrowLeft,
  Globe,
  CheckCircle2,
  Send,
  LogIn,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { JobVacancy } from '../../types/job.types';
import { jobApi } from '../../services/jobApi';
import { useAuth } from '../../context/AuthContext';
import { PageContainer } from '../../components/common/PageContainer';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { ApplyModal } from '../../components/applications/ApplyModal';
import { formatDate, formatSalary } from '../../utils/formatters';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();

  const [job, setJob] = useState<JobVacancy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);

  const fetchJobDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobApi.getJobById(id);
      setJob(data);
    } catch {
      setError('Lowongan tidak ditemukan atau terjadi kesalahan saat memuat data.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJobDetail();
  }, [fetchJobDetail]);

  const handleApplySuccess = () => {
    setIsApplyModalOpen(false);
    setApplySuccessMessage('Lamaran Anda berhasil dikirimkan ke perusahaan!');
    if (job) {
      setJob({
        ...job,
        hasApplied: true,
        userApplicationStatus: 'APPLIED'
      });
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner isFullScreen message="Memuat detail lowongan pekerjaan..." />
      </PageContainer>
    );
  }

  if (error || !job) {
    return (
      <PageContainer>
        <div style={{ maxWidth: '640px', margin: '2rem auto' }}>
          <Alert variant="error" title="Gagal Memuat Lowongan">
            <p>{error || 'Lowongan pekerjaan tidak ditemukan.'}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <Link to="/jobs">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
                  Kembali ke Daftar Lowongan
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchJobDetail}>
                Coba Lagi
              </Button>
            </div>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      action={
        <Link to="/jobs" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <ArrowLeft size={16} />
          <span>Kembali ke Lowongan</span>
        </Link>
      }
    >
      {applySuccessMessage && (
        <Alert
          variant="success"
          title="Lamaran Terkirim"
          onClose={() => setApplySuccessMessage(null)}
          className="mb-4"
        >
          <p>{applySuccessMessage}</p>
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/applications" style={{ fontWeight: 600, textDecoration: 'underline' }}>
              Lihat status lamaran di menu &quot;Lamaran Saya&quot; →
            </Link>
          </div>
        </Alert>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '2rem',
          alignItems: 'start'
        }}
      >
        {/* Main Content Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Lowongan Terverifikasi
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  {job.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontWeight: 700, fontSize: '1.0625rem' }}>
                  <Building2 size={18} />
                  <span>{job.company.companyName}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <StatusBadge status={job.jobType} />
                <StatusBadge status={job.status} />
              </div>
            </div>

            {/* Quick Metadata Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                padding: '1rem 0',
                borderTop: '1px solid var(--gray-100)',
                borderBottom: '1px solid var(--gray-100)'
              }}
            >
              <span className="meta-tag" style={{ fontSize: '0.875rem' }}>
                <MapPin size={17} color="var(--primary-600)" />
                <strong>{job.location}</strong>
              </span>
              <span className="meta-tag" style={{ fontSize: '0.875rem' }}>
                <Banknote size={17} color="#059669" />
                <strong style={{ color: '#059669' }}>
                  {formatSalary(job.salaryMin, job.salaryMax, job.isNegotiable)}
                </strong>
              </span>
              <span className="meta-tag" style={{ fontSize: '0.875rem' }}>
                <Calendar size={17} color="var(--gray-400)" />
                <span>Dipasang {formatDate(job.createdAt)}</span>
              </span>
            </div>
          </Card>

          {/* Job Description Card */}
          <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>
              Deskripsi Pekerjaan
            </h2>
            <div
              style={{
                color: 'var(--gray-700)',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                fontSize: '0.9375rem'
              }}
            >
              {job.description}
            </div>
          </Card>

          {/* Job Requirements Card */}
          <Card>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>
              Kualifikasi & Persyaratan
            </h2>
            <div
              style={{
                color: 'var(--gray-700)',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                fontSize: '0.9375rem'
              }}
            >
              {job.requirements}
            </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action / Application Status Card */}
          <Card>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>
              Pengajuan Lamaran
            </h3>

            {/* State 1: Guest (Not logged in) */}
            {!user && (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  Masuk dengan akun Pencari Kerja Anda untuk mengirimkan lamaran ke posisi ini.
                </p>
                <Link to="/login" state={{ from: location }} style={{ display: 'block', marginBottom: '0.75rem' }}>
                  <Button variant="primary" size="md" isFullWidth leftIcon={<LogIn size={16} />}>
                    Masuk untuk Melamar
                  </Button>
                </Link>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                  Belum punya akun?{' '}
                  <Link to="/register" style={{ fontWeight: 600 }}>
                    Daftar di sini
                  </Link>
                </p>
              </div>
            )}

            {/* State 2: Company Account */}
            {user && user.role === 'COMPANY' && (
              <div
                style={{
                  backgroundColor: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  textAlign: 'center'
                }}
              >
                <Briefcase size={28} color="var(--gray-400)" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', fontWeight: 600 }}>
                  Akun Perusahaan
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                  Anda sedang masuk menggunakan akun Perusahaan. Fitur melamar hanya tersedia untuk akun Pencari Kerja.
                </p>
              </div>
            )}

            {/* State 3: Job Seeker who already applied */}
            {user && user.role === 'JOB_SEEKER' && job.hasApplied && (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  textAlign: 'center'
                }}
              >
                <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
                  Lamaran Sudah Dikirim
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#047857', marginBottom: '1rem' }}>
                  Anda telah mengajukan lamaran untuk lowongan ini.
                </p>

                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', display: 'block', marginBottom: '0.375rem' }}>
                    Status Saat Ini:
                  </span>
                  <StatusBadge status={job.userApplicationStatus || 'APPLIED'} />
                </div>

                <Link to="/applications" style={{ display: 'block' }}>
                  <Button variant="outline" size="sm" isFullWidth>
                    Lihat di Lamaran Saya
                  </Button>
                </Link>
              </div>
            )}

            {/* State 4: Job Seeker who has not applied yet */}
            {user && user.role === 'JOB_SEEKER' && !job.hasApplied && (
              <div>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  Lamar posisi ini dengan profil Anda sekarang. Anda dapat menambahkan surat pengantar atau portofolio.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  isFullWidth
                  leftIcon={<Send size={18} />}
                  onClick={() => setIsApplyModalOpen(true)}
                >
                  Lamar Sekarang
                </Button>
              </div>
            )}
          </Card>

          {/* Company Profile Card */}
          <Card>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>
              Tentang Perusahaan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--gray-900)' }}>
                  {job.company.companyName}
                </strong>
                {job.company.industry && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                    {job.company.industry}
                  </span>
                )}
              </div>

              {job.company.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  <MapPin size={16} />
                  <span>{job.company.location}</span>
                </div>
              )}

              {job.company.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5, marginTop: '0.25rem' }}>
                  {job.company.description}
                </p>
              )}

              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--primary-600)',
                    marginTop: '0.5rem'
                  }}
                >
                  <Globe size={15} />
                  <span>Kunjungi Situs Web</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Apply Modal Component */}
      <ApplyModal
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company.companyName}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={handleApplySuccess}
      />
    </PageContainer>
  );
};
