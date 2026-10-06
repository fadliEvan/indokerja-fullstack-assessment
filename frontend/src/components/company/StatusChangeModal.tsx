import React, { useState } from 'react';
import { X, Check, AlertCircle, FileEdit, ArrowRight } from 'lucide-react';
import { ApplicationStatus, Application } from '../../types/application.types';
import { companyApi } from '../../services/companyApi';
import { ApiError } from '../../services/apiClient';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

export interface StatusChangeModalProps {
  applicationId: string;
  candidateName: string;
  currentStatus: ApplicationStatus;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedApplication: Application) => void;
}

// Strict backend-aligned transition state machine
const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ['REVIEWING'],
  REVIEWING: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: []
};

const STATUS_DESCRIPTIONS: Record<ApplicationStatus, string> = {
  APPLIED: 'Lamaran baru masuk dari kandidat',
  REVIEWING: 'Berkas dan profil sedang dalam tahap evaluasi HR / Tim Rekrutmen',
  SHORTLISTED: 'Kandidat lolos seleksi berkas dan masuk tahap interview/asesmen',
  ACCEPTED: 'Kandidat resmi diterima untuk posisi ini (Keputusan Akhir)',
  REJECTED: 'Kandidat belum memenuhi kualifikasi yang dibutuhkan (Keputusan Akhir)'
};

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  applicationId,
  candidateName,
  currentStatus,
  isOpen,
  onClose,
  onSuccess
}) => {
  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>(
    allowedNextStatuses.length > 0 ? allowedNextStatuses[0] : ''
  );
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isTerminal = allowedNextStatuses.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const updatedApp = await companyApi.updateCandidateStatus(applicationId, {
        status: selectedStatus,
        note: note.trim() || null
      });

      onSuccess(updatedApp);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal memperbarui status kandidat. Silakan coba kembali.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              Perbarui Status Kandidat
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.125rem' }}>
              {candidateName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gray-500)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Current Status Box */}
            <div
              style={{
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)', fontWeight: 600 }}>
                Status Saat Ini:
              </span>
              <StatusBadge status={currentStatus} />
            </div>

            {isTerminal ? (
              <div
                style={{
                  backgroundColor: 'var(--gray-100)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  textAlign: 'center',
                  color: 'var(--gray-600)'
                }}
              >
                <AlertCircle size={32} color="var(--gray-400)" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--gray-800)' }}>
                  Keputusan Akhir Telah Ditetapkan
                </p>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                  Status {currentStatus} merupakan status akhir dan tidak dapat diubah kembali.
                </p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <ArrowRight size={15} color="var(--primary-600)" />
                    <span>Pilih Status Selanjutnya:</span>
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.25rem' }}>
                    {allowedNextStatuses.map((nextSt) => {
                      const isSelected = selectedStatus === nextSt;

                      return (
                        <div
                          key={nextSt}
                          onClick={() => setSelectedStatus(nextSt)}
                          style={{
                            border: `2px solid ${isSelected ? 'var(--primary-600)' : 'var(--gray-200)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '0.875rem',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'var(--primary-50)' : '#ffffff',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <StatusBadge status={nextSt} />
                            {isSelected && <Check size={18} color="var(--primary-600)" />}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', margin: 0 }}>
                            {STATUS_DESCRIPTIONS[nextSt]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="status-note" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <FileEdit size={15} />
                    <span>Catatan Review Internal (Opsional)</span>
                  </label>
                  <textarea
                    id="status-note"
                    className="form-control"
                    placeholder="Tuliskan catatan evaluasi, jadwal interview, atau alasan keputusan..."
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={1000}
                  />
                  <p className="form-helper">Maksimal 1000 karakter. Catatan akan tercatat dalam linimasa riwayat status.</p>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {isTerminal ? 'Tutup' : 'Batal'}
            </button>
            {!isTerminal && (
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!selectedStatus}
                leftIcon={<Check size={16} />}
              >
                Konfirmasi Perubahan Status
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
