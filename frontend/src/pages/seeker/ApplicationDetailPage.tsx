import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
  FileText,
  Link2,
  Clock,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { Application } from '../../types/application.types';
import { applicationApi } from '../../services/applicationApi';
import { PageContainer } from '../../components/common/PageContainer';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await applicationApi.getMyApplicationById(id);
      setApplication(data);
    } catch {
      setError('Gagal memuat detail lamaran atau Anda tidak memiliki akses ke lamaran ini.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner isFullScreen message="Memuat detail lamaran & riwayat status..." />
      </PageContainer>
    );
  }

  if (error || !application) {
    return (
      <PageContainer>
        <div style={{ maxWidth: '640px', margin: '2rem auto' }}>
          <Alert variant="error" title="Gagal Memuat Lamaran">
            <p>{error || 'Lamaran tidak ditemukan.'}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <Link to="/applications">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
                  Kembali ke Lamaran Saya
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchApplication}>
                Coba Lagi
              </Button>
            </div>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  // Ensure chronological ordering: oldest -> newest
  const sortedHistory = [...(application.history || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <PageContainer
      action={
        <Link to="/applications" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <ArrowLeft size={16} />
          <span>Kembali ke Lamaran Saya</span>
        </Link>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)',
          gap: '2rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Job & Submission Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Detail Lamaran Pekerjaan
                </span>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  <Link to={`/jobs/${application.jobId}`} style={{ color: 'inherit' }}>
                    {application.job.title}
                  </Link>
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontWeight: 700, fontSize: '1rem' }}>
                  <Building2 size={18} />
                  <span>{application.job.company.companyName}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', textAlign: 'right', marginBottom: '0.25rem' }}>
                  Status Saat Ini
                </span>
                <StatusBadge status={application.status} />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--gray-100)'
              }}
            >
              {application.job.location && (
                <span className="meta-tag">
                  <MapPin size={16} color="var(--primary-600)" />
                  <span>{application.job.location}</span>
                </span>
              )}
              {application.job.jobType && (
                <span className="meta-tag">
                  <StatusBadge status={application.job.jobType} size="sm" />
                </span>
              )}
              <span className="meta-tag">
                <Calendar size={16} color="var(--gray-400)" />
                <span>Diajukan pada {formatDate(application.createdAt)}</span>
              </span>
            </div>
          </Card>

          {/* Submission Data Card */}
          <Card>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--primary-600)" />
              <span>Informasi yang Anda Kirimkan</span>
            </h2>

            {/* Cover Note */}
            <div style={{ marginBottom: '1.25rem' }}>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--gray-700)', marginBottom: '0.375rem' }}>
                Catatan / Surat Pengantar:
              </strong>
              {application.coverNote ? (
                <div
                  style={{
                    backgroundColor: 'var(--gray-50)',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)',
                    fontSize: '0.875rem',
                    color: 'var(--gray-800)',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6
                  }}
                >
                  {application.coverNote}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                  Tidak menyertakan surat pengantar
                </p>
              )}
            </div>

            {/* Resume URL */}
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--gray-700)', marginBottom: '0.375rem' }}>
                Tautan Portofolio / Resume Online:
              </strong>
              {application.resumeUrl ? (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none' }}
                >
                  <Link2 size={15} />
                  <span>Buka Tautan Portofolio/CV</span>
                  <ExternalLink size={13} />
                </a>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                  Tidak menyertakan tautan portofolio eksternal
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Full Status History Timeline */}
        <div>
          <Card>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary-600)" />
              <span>Linimasa Riwayat Status</span>
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
              Catatan kronologis perubahan tahapan seleksi dari awal hingga saat ini
            </p>

            {sortedHistory.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                Belum ada riwayat status tercatat.
              </p>
            ) : (
              <div className="timeline">
                {sortedHistory.map((item, index) => {
                  const isLatest = index === sortedHistory.length - 1;

                  return (
                    <div key={item.id} className="timeline-item">
                      <div className={`timeline-node ${isLatest ? 'timeline-node-active' : ''}`}>
                        {isLatest ? '●' : '○'}
                      </div>

                      <div className="timeline-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item.previousStatus && (
                              <>
                                <StatusBadge status={item.previousStatus} size="sm" />
                                <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>➔</span>
                              </>
                            )}
                            <StatusBadge status={item.newStatus} size="sm" />
                          </div>

                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>

                        {/* Actor information */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--gray-600)', marginBottom: item.note ? '0.5rem' : 0 }}>
                          <UserCheck size={14} color="var(--primary-600)" />
                          <span>
                            {item.changedBy?.role === 'COMPANY'
                              ? `Diperbarui oleh Tim Rekrutmen (${application.job.company.companyName})`
                              : `Diajukan oleh ${item.changedBy?.fullName || 'Pencari Kerja'}`}
                          </span>
                        </div>

                        {/* Note when provided */}
                        {item.note && (
                          <div
                            style={{
                              marginTop: '0.5rem',
                              padding: '0.5rem 0.75rem',
                              backgroundColor: 'var(--gray-50)',
                              borderLeft: '3px solid var(--primary-500)',
                              fontSize: '0.8125rem',
                              color: 'var(--gray-700)',
                              lineHeight: 1.5
                            }}
                          >
                            <strong>Catatan:</strong> {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
