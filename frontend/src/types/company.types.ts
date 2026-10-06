import { ApplicationStatus } from './application.types';
import { JobType, JobStatus } from './job.types';

export interface CompanyJobVacancy {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: JobType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  isNegotiable: boolean;
  status: JobStatus;
  applicantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateSeeker {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
}

export interface CandidateApplication {
  id: string;
  status: ApplicationStatus;
  coverNote?: string | null;
  resumeUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  seeker: CandidateSeeker;
}

export interface UpdateCandidateStatusInput {
  status: ApplicationStatus;
  note?: string | null;
}
