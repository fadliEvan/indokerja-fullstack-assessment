import React, { useState } from 'react';
import { X, Send, AlertCircle, FileText, Link2 } from 'lucide-react';
import { applicationApi } from '../../services/applicationApi';
import { ApiError } from '../../services/apiClient';
import { Application } from '../../types/application.types';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

export interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (application: Application) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  jobId,
  jobTitle,
  companyName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    setUrlError(null);
    if (resumeUrl.trim()) {
      try {
        const parsed = new URL(resumeUrl.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setUrlError('Tautan harus menggunakan protokol http:// atau https://');
          return false;
        }
      } catch {
        setUrlError('Format URL portofolio/CV tidak valid (contoh: https://drive.google.com/...)');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const createdApplication = await applicationApi.applyForJob({
        jobId,
        coverNote: coverNote.trim() || null,
        resumeUrl: resumeUrl.trim() || null
      });

      onSuccess(createdApplication);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError('Anda sudah pernah mengajukan lamaran untuk lowongan ini.');
        } else if (err.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Gagal mengirimkan lamaran. Silakan coba kembali.');
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
              Kirim Lamaran Kerja
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.125rem' }}>
              {jobTitle} • {companyName}
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {error && (
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <div
              style={{
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-100)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
                color: 'var(--primary-700)',
                display: 'flex',
                gap: '0.625rem',
                alignItems: 'flex-start'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Profil dasar akun Anda (Nama, Email, dan Telepon) akan otomatis dikirimkan ke tim rekrutmen <strong>{companyName}</strong>.
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cover-note" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FileText size={15} />
                <span>Catatan / Surat Pengantar (Opsional)</span>
              </label>
              <textarea
                id="cover-note"
                className="form-control"
                placeholder="Tuliskan perkenalan singkat atau alasan Anda tertarik melamar posisi ini..."
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                maxLength={2000}
              />
              <p className="form-helper">Maksimal 2000 karakter</p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="resume-url" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Link2 size={15} />
                <span>Tautan Portofolio / Resume Online (Opsional)</span>
              </label>
              <input
                id="resume-url"
                type="url"
                className={`form-control ${urlError ? 'is-invalid' : ''}`}
                placeholder="https://drive.google.com/file/... atau https://linkedin.com/in/..."
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
              />
              {urlError ? (
                <p className="form-error">{urlError}</p>
              ) : (
                <p className="form-helper">Pastikan tautan dapat diakses secara publik</p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Send size={16} />}
            >
              Kirim Lamaran
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
