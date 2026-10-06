import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { JobType } from '../../types/job.types';
import { companyApi } from '../../services/companyApi';
import { ApiError } from '../../services/apiClient';
import { PageContainer } from '../../components/common/PageContainer';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

interface FormErrors {
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
  jobType?: string;
  salaryMin?: string;
  salaryMax?: string;
}

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [jobType, setJobType] = useState<JobType>('FULL_TIME');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim() || title.trim().length < 3) {
      newErrors.title = 'Judul lowongan minimal 3 karakter';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Judul lowongan maksimal 100 karakter';
    }

    if (!location.trim() || location.trim().length < 2) {
      newErrors.location = 'Lokasi penempatan wajib diisi';
    }

    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Deskripsi pekerjaan minimal 10 karakter';
    }

    if (!requirements.trim() || requirements.trim().length < 10) {
      newErrors.requirements = 'Kualifikasi pekerjaan minimal 10 karakter';
    }

    const minNum = salaryMin.trim() ? parseInt(salaryMin.trim(), 10) : null;
    const maxNum = salaryMax.trim() ? parseInt(salaryMax.trim(), 10) : null;

    if (minNum !== null && (isNaN(minNum) || minNum <= 0)) {
      newErrors.salaryMin = 'Gaji minimum harus bernilai angka positif';
    }

    if (maxNum !== null && (isNaN(maxNum) || maxNum <= 0)) {
      newErrors.salaryMax = 'Gaji maksimum harus bernilai angka positif';
    }

    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      newErrors.salaryMin = 'Gaji minimum tidak boleh lebih besar dari gaji maksimum';
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
      const minNum = salaryMin.trim() ? parseInt(salaryMin.trim(), 10) : null;
      const maxNum = salaryMax.trim() ? parseInt(salaryMax.trim(), 10) : null;

      await companyApi.createJob({
        title: title.trim(),
        location: location.trim(),
        jobType,
        description: description.trim(),
        requirements: requirements.trim(),
        salaryMin: minNum,
        salaryMax: maxNum,
        isNegotiable
      });

      navigate('/company/jobs', { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.details) {
          const details = err.details as Array<{ field?: string; message: string }>;
          if (Array.isArray(details) && details.length > 0) {
            const mapped: FormErrors = {};
            details.forEach((d) => {
              if (d.field === 'title') mapped.title = d.message;
              if (d.field === 'description') mapped.description = d.message;
              if (d.field === 'requirements') mapped.requirements = d.message;
              if (d.field === 'location') mapped.location = d.message;
              if (d.field === 'salaryMin') mapped.salaryMin = d.message;
              if (d.field === 'salaryMax') mapped.salaryMax = d.message;
            });
            setErrors(mapped);
          }
        }
        setServerError(err.message);
      } else {
        setServerError('Gagal mempublikasikan lowongan. Silakan coba kembali.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Pasang Lowongan Pekerjaan Baru"
      subtitle="Publikasikan posisi baru untuk merekrut talenta terbaik ke perusahaan Anda"
      action={
        <Link to="/company/jobs" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <ArrowLeft size={16} />
          <span>Kembali ke Lowongan</span>
        </Link>
      }
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card padding="lg">
          {serverError && (
            <Alert variant="error" onClose={() => setServerError(null)}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <Input
              label="Judul Posisi Lowongan"
              type="text"
              placeholder="Contoh: Senior Fullstack Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />

            {/* Grid: Job Type & Location */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem'
              }}
            >
              <Select
                label="Tipe Pekerjaan"
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                error={errors.jobType}
                required
              >
                <option value="FULL_TIME">Full-Time (Purna Waktu)</option>
                <option value="PART_TIME">Part-Time (Paruh Waktu)</option>
                <option value="CONTRACT">Kontrak (Contract)</option>
                <option value="REMOTE">Remote (Jarak Jauh)</option>
              </Select>

              <Input
                label="Lokasi Penempatan"
                type="text"
                placeholder="Contoh: Jakarta Selatan / Hybrid"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={errors.location}
                required
              />
            </div>

            {/* Grid: Salary Min & Max */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem'
              }}
            >
              <Input
                label="Gaji Minimum (IDR / Bulan, Opsional)"
                type="number"
                placeholder="Contoh: 10000000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                error={errors.salaryMin}
                min={0}
              />

              <Input
                label="Gaji Maksimum (IDR / Bulan, Opsional)"
                type="number"
                placeholder="Contoh: 15000000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                error={errors.salaryMax}
                min={0}
              />
            </div>

            {/* Checkbox: Negotiable */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-checkbox-group">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)', fontWeight: 600 }}>
                  Gaji dapat dinegosiasikan (isNegotiable)
                </span>
              </label>
              <p className="form-helper" style={{ marginLeft: '1.75rem' }}>
                Centang opsi ini jika rentang gaji fleksibel atau bergantung pada kualifikasi pelamar.
              </p>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="job-description" className="form-label">
                Deskripsi Pekerjaan <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="job-description"
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                placeholder="Jelaskan peran, tanggung jawab utama, dan tantangan yang akan dihadapi kandidat..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              {errors.description && <p className="form-error">{errors.description}</p>}
              <p className="form-helper">Minimal 10 karakter.</p>
            </div>

            {/* Requirements */}
            <div className="form-group">
              <label htmlFor="job-requirements" className="form-label">
                Kualifikasi & Persyaratan <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="job-requirements"
                className={`form-control ${errors.requirements ? 'is-invalid' : ''}`}
                placeholder="Tuliskan persyaratan keahlian, pengalaman kerja, tools, dan kualifikasi yang dicari..."
                rows={5}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                required
              />
              {errors.requirements && <p className="form-error">{errors.requirements}</p>}
              <p className="form-helper">Minimal 10 karakter. Anda dapat menggunakan baris baru atau poin-poin.</p>
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '2rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--gray-200)'
              }}
            >
              <Link to="/company/jobs" className="btn btn-secondary">
                Batal
              </Link>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<PlusCircle size={16} />}
              >
                Publikasikan Lowongan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};
