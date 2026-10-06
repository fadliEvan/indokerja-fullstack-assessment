import React from 'react';
import { ApplicationStatus } from '../../types/application.types';
import { JobStatus, JobType } from '../../types/job.types';

export interface StatusBadgeProps {
  status: ApplicationStatus | JobStatus | JobType | string;
  size?: 'sm' | 'md';
}

const STATUS_LABELS: Record<string, string> = {
  // Application Statuses
  APPLIED: 'Terkirim',
  REVIEWING: 'Ditinjau',
  SHORTLISTED: 'Lolos Seleksi',
  REJECTED: 'Ditolak',
  ACCEPTED: 'Diterima',

  // Job Vacancy Statuses
  OPEN: 'Aktif',
  CLOSED: 'Ditutup',

  // Job Types
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Kontrak',
  REMOTE: 'Remote'
};

const STATUS_CLASSNAMES: Record<string, string> = {
  APPLIED: 'badge-applied',
  REVIEWING: 'badge-reviewing',
  SHORTLISTED: 'badge-shortlisted',
  REJECTED: 'badge-rejected',
  ACCEPTED: 'badge-accepted',

  OPEN: 'badge-accepted',
  CLOSED: 'badge-rejected',

  FULL_TIME: 'badge-applied',
  PART_TIME: 'badge-reviewing',
  CONTRACT: 'badge-shortlisted',
  REMOTE: 'badge-accepted'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const badgeClass = STATUS_CLASSNAMES[status] || 'badge-applied';
  const label = STATUS_LABELS[status] || status;
  const sizeStyle = size === 'sm' ? { fontSize: '0.6875rem', padding: '0.125rem 0.5rem' } : {};

  return (
    <span className={`badge ${badgeClass}`} style={sizeStyle}>
      {label}
    </span>
  );
};
