import React, { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, Filter, RotateCcw } from 'lucide-react';
import { JobVacancy, JobType } from '../../types/job.types';
import { jobApi } from '../../services/jobApi';
import { JobCard } from '../../components/jobs/JobCard';
import { PageContainer } from '../../components/common/PageContainer';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [keyword, setKeyword] = useState('');
  const [jobType, setJobType] = useState<JobType | ''>('');
  const [location, setLocation] = useState('');

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobApi.getJobs({
        keyword: keyword.trim() || undefined,
        jobType: jobType || undefined,
        location: location.trim() || undefined
      });
      setJobs(data);
    } catch {
      setError('Gagal memuat daftar lowongan pekerjaan. Periksa koneksi Anda dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, jobType, location]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setJobType('');
    setLocation('');
  };

  const hasActiveFilters = Boolean(keyword || jobType || location);

  return (
    <PageContainer
      title="Jelajahi Lowongan Pekerjaan"
      subtitle="Temukan peluang karir yang sesuai dengan keahlian dan minat Anda"
    >
      {/* Search and Filters Card */}
      <Card style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleFilterSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end'
            }}
          >
            {/* Keyword Search */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="search-keyword" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Search size={15} />
                <span>Kata Kunci / Posisi</span>
              </label>
              <input
                id="search-keyword"
                type="text"
                className="form-control"
                placeholder="Contoh: Frontend, Backend, UI/UX..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* Job Type Dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-jobtype" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Filter size={15} />
                <span>Tipe Pekerjaan</span>
              </label>
              <select
                id="filter-jobtype"
                className="form-control"
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType | '')}
              >
                <option value="">Semua Tipe Pekerjaan</option>
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="CONTRACT">Kontrak</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            {/* Location Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-location" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <MapPin size={15} />
                <span>Lokasi</span>
              </label>
              <input
                id="filter-location"
                type="text"
                className="form-control"
                placeholder="Contoh: Jakarta, Bandung..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button type="submit" variant="primary" leftIcon={<Search size={16} />} style={{ flex: 1 }}>
                Cari
              </Button>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResetFilters}
                  title="Reset Filter"
                  style={{ padding: '0.625rem' }}
                >
                  <RotateCcw size={16} />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      {/* Content Area */}
      {isLoading && (
        <LoadingSpinner message="Memuat daftar lowongan pekerjaan..." />
      )}

      {!isLoading && error && (
        <Alert variant="error" title="Terjadi Kesalahan">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchJobs}
            style={{ marginTop: '0.75rem' }}
          >
            Coba Lagi
          </Button>
        </Alert>
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <EmptyState
          icon={<Search size={44} color="var(--gray-400)" />}
          title={hasActiveFilters ? 'Tidak ada lowongan yang sesuai' : 'Belum ada lowongan pekerjaan'}
          description={
            hasActiveFilters
              ? 'Coba gunakan kata kunci pencarian yang berbeda atau reset filter Anda.'
              : 'Saat ini belum ada lowongan pekerjaan yang dibuka. Silakan cek kembali nanti.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                Reset Filter
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.9375rem', fontWeight: 600 }}>
              Menampilkan {jobs.length} lowongan pekerjaan
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
};
