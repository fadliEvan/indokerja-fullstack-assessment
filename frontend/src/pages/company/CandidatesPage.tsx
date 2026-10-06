import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Edit3,
  History,
  FileText,
  Search
} from 'lucide-react';
import { CandidateApplication } from '../../types/company.types';
import { Application } from '../../types/application.types';
import { companyApi } from '../../services/companyApi';
import { PageContainer } from '../../components/common/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { StatusChangeModal } from '../../components/company/StatusChangeModal';
import { CandidateHistoryModal } from '../../components/company/CandidateHistoryModal';
import { formatDate } from '../../utils/formatters';

export const CandidatesPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();

  const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  // Status Change Modal State
  const [selectedForStatusChange, setSelectedForStatusChange] = useState<CandidateApplication | null>(null);

  // History Modal State
  const [selectedForHistory, setSelectedForHistory] = useState<CandidateApplication | null>(null);

  const fetchCandidates = useCallback(async () => {
    if (!jobId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await companyApi.getJobCandidates(jobId);
      setCandidates(data);
    } catch {
      setError('Gagal memuat daftar pelamar atau Anda tidak memiliki akses ke lowongan ini.');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleStatusUpdateSuccess = (updatedApp: Application) => {
    // Update candidate in local state
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === updatedApp.id
          ? {
              ...c,
              status: updatedApp.status,
              updatedAt: updatedApp.updatedAt
            }
          : c
      )
    );
    setSelectedForStatusChange(null);
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      c.seeker.fullName.toLowerCase().includes(q) ||
      c.seeker.email.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  });

  return (
    <PageContainer
      title="Daftar Pelamar Lowongan"
      subtitle="Tinjau berkas lamaran dan kelola tahapan seleksi setiap kandidat"
      action={
        <Link to="/company/jobs" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <ArrowLeft size={16} />
          <span>Kembali ke Lowongan</span>
        </Link>
      }
    >
      {/* Search / Filter in Candidates */}
      {!isLoading && !error && candidates.length > 0 && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search
              size={16}
              color="var(--gray-400)"
              style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Cari nama atau email pelamar..."
              style={{ paddingLeft: '2.5rem' }}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>

          <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: 600 }}>
            Menampilkan {filteredCandidates.length} dari {candidates.length} kandidat
          </div>
        </div>
      )}

      {isLoading && (
        <LoadingSpinner message="Memuat daftar pelamar kerja..." />
      )}

      {!isLoading && error && (
        <Alert variant="error" title="Gagal Memuat Pelamar">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCandidates}
            style={{ marginTop: '0.75rem' }}
          >
            Coba Lagi
          </Button>
        </Alert>
      )}

      {!isLoading && !error && candidates.length === 0 && (
        <EmptyState
          icon={<Users size={48} color="var(--primary-600)" />}
          title="Belum ada pelamar"
          description="Belum ada pencari kerja yang mengajukan lamaran untuk posisi ini. Lowongan Anda telah aktif dan dapat ditemukan oleh para pencari kerja."
          action={
            <Link to="/company/jobs">
              <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
                Kembali ke Daftar Lowongan
              </Button>
            </Link>
          }
        />
      )}

      {!isLoading && !error && candidates.length > 0 && (
        <>
          {/* Desktop / Tablet Table View */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Kandidat</th>
                  <th>Kontak</th>
                  <th>Status Lamaran</th>
                  <th>Tanggal Melamar</th>
                  <th>Catatan / Berkas</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    {/* Name */}
                    <td>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--gray-900)' }}>
                        {candidate.seeker.fullName}
                      </strong>
                    </td>

                    {/* Contact */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--gray-600)' }}>
                          <Mail size={13} color="var(--gray-400)" />
                          {candidate.seeker.email}
                        </span>
                        {candidate.seeker.phone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--gray-600)' }}>
                            <Phone size={13} color="var(--gray-400)" />
                            {candidate.seeker.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={candidate.status} />
                    </td>

                    {/* Date */}
                    <td>
                      <span className="meta-tag">
                        <Calendar size={14} color="var(--gray-400)" />
                        <span>{formatDate(candidate.createdAt)}</span>
                      </span>
                    </td>

                    {/* Cover Note & Resume */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxWidth: '240px' }}>
                        {candidate.coverNote ? (
                          <span
                            title={candidate.coverNote}
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--gray-700)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {candidate.coverNote}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                            Tanpa catatan
                          </span>
                        )}

                        {candidate.resumeUrl && (
                          <a
                            href={candidate.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--primary-600)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <span>Lihat Portofolio/CV</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setSelectedForStatusChange(candidate)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Edit3 size={13} />
                          <span>Ubah Status</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedForHistory(candidate)}
                          title="Lihat Linimasa Riwayat"
                          style={{ padding: '0.375rem 0.5rem' }}
                        >
                          <History size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (Hidden on desktop via media queries/flex wrap) */}
          <div style={{ display: 'none' }} className="mobile-only-cards">
            {/* Handled natively by data-table-container responsive scroll */}
          </div>
        </>
      )}

      {/* Status Change Modal */}
      {selectedForStatusChange && (
        <StatusChangeModal
          applicationId={selectedForStatusChange.id}
          candidateName={selectedForStatusChange.seeker.fullName}
          currentStatus={selectedForStatusChange.status}
          isOpen={!!selectedForStatusChange}
          onClose={() => setSelectedForStatusChange(null)}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}

      {/* Candidate History Modal */}
      {selectedForHistory && (
        <CandidateHistoryModal
          applicationId={selectedForHistory.id}
          candidateName={selectedForHistory.seeker.fullName}
          isOpen={!!selectedForHistory}
          onClose={() => setSelectedForHistory(null)}
        />
      )}
    </PageContainer>
  );
};
