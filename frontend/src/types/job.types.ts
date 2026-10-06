export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'REMOTE';
export type JobStatus = 'OPEN' | 'CLOSED';

export interface CompanySummary {
  id: string;
  companyName: string;
  industry?: string | null;
  location?: string | null;
  description?: string | null;
  website?: string | null;
}

export interface JobVacancy {
  id: string;
  companyId: string;
  company: CompanySummary;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: JobType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  isNegotiable: boolean;
  status: JobStatus;
  createdAt: string;
  updatedAt?: string;
  applicantCount?: number;
  hasApplied?: boolean;
  userApplicationStatus?: string | null;
}

export interface CreateJobInput {
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: JobType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  isNegotiable?: boolean;
}

export interface JobQueryInput {
  keyword?: string;
  jobType?: JobType;
  location?: string;
}
