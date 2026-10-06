import React, { useEffect, useState } from 'react';
import { X, Clock, UserCheck } from 'lucide-react';
import { ApplicationHistory } from '../../types/application.types';
import { companyApi } from '../../services/companyApi';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Alert } from '../common/Alert';
import { formatDateTime } from '../../utils/formatters';

export interface CandidateHistoryModalProps {
  applicationId: string;
  candidateName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateHistoryModal: React.FC<CandidateHistoryModalProps> = ({
  applicationId,
  candidateName,
  isOpen,
  onClose
}) => {
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    companyApi
      .getApplicationHistory(applicationId)
      .then((data) => {
        if (isMounted) {
          // Sort oldest -> newest
          const sorted = [...data].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setHistory(sorted);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Gagal memuat linimasa riwayat status lamaran.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              Riwayat Status Seleksi
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.125rem' }}>
              Kandidat: <strong>{candidateName}</strong>
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

        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {isLoading && (
            <LoadingSpinner message="Memuat riwayat audit..." />
          )}

          {!isLoading && error && (
            <Alert variant="error" title="Gagal Memuat Data">
              {error}
            </Alert>
          )}

          {!isLoading && !error && history.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--gray-500)' }}>
              <Clock size={32} color="var(--gray-400)" style={{ margin: '0 auto 0.5rem auto' }} />
              <p>Belum ada riwayat tercatat untuk lamaran ini.</p>
            </div>
          )}

          {!isLoading && !error && history.length > 0 && (
            <div className="timeline" style={{ margin: '0.5rem 0 0.5rem 1rem' }}>
              {history.map((item, index) => {
                const isLatest = index === history.length - 1;

                return (
                  <div key={item.id} className="timeline-item">
                    <div className={`timeline-node ${isLatest ? 'timeline-node-active' : ''}`}>
                      {isLatest ? '●' : '○'}
                    </div>

                    <div className="timeline-card">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
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

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontSize: '0.8125rem',
                          color: 'var(--gray-600)',
                          marginBottom: item.note ? '0.375rem' : 0
                        }}
                      >
                        <UserCheck size={14} color="var(--primary-600)" />
                        <span>
                          {item.changedBy?.role === 'COMPANY'
                            ? `Diperbarui oleh ${item.changedBy.fullName || 'Tim Rekrutmen'}`
                            : `Diajukan oleh ${item.changedBy?.fullName || 'Kandidat'}`}
                        </span>
                      </div>

                      {item.note && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'var(--gray-50)',
                            borderLeft: '3px solid var(--primary-500)',
                            fontSize: '0.8125rem',
                            color: 'var(--gray-700)',
                            lineHeight: 1.4
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
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
