import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Banknote, Calendar, ArrowRight } from 'lucide-react';
import { JobVacancy } from '../../types/job.types';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, formatSalary } from '../../utils/formatters';

export interface JobCardProps {
  job: JobVacancy;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <Card className="job-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
            <Link to={`/jobs/${job.id}`} style={{ color: 'inherit' }}>
              {job.title}
            </Link>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.9375rem' }}>
            <Building2 size={16} />
            <span>{job.company.companyName}</span>
          </div>
        </div>
        <StatusBadge status={job.jobType} size="sm" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '0.75rem 0 1.25rem 0' }}>
        <span className="meta-tag">
          <MapPin size={15} color="var(--gray-400)" />
          <span>{job.location}</span>
        </span>
        <span className="meta-tag">
          <Banknote size={15} color="var(--gray-400)" />
          <span>{formatSalary(job.salaryMin, job.salaryMax, job.isNegotiable)}</span>
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
          marginBottom: '1.25rem',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {job.description}
      </p>

      <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {job.hasApplied ? (
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            ✓ Sudah Dilamar
          </span>
        ) : (
          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
            Status: Terbuka
          </span>
        )}

        <Link
          to={`/jobs/${job.id}`}
          className="btn btn-outline btn-sm"
          style={{ textDecoration: 'none', marginLeft: 'auto' }}
        >
          <span>Detail Lowongan</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </Card>
  );
};
