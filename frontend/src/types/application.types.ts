import { JobType } from './job.types';

export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED';

export interface ApplicationSeekerSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
}

export interface ApplicationJobSummary {
  id: string;
  title: string;
  location?: string;
  jobType?: JobType;
  company: {
    id?: string;
    companyName: string;
    location?: string | null;
    industry?: string | null;
  };
}

export interface ApplicationHistoryUser {
  id: string;
  fullName: string;
  role: string;
}

export interface ApplicationHistory {
  id: string;
  applicationId: string;
  previousStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  changedById: string;
  changedBy?: ApplicationHistoryUser;
  note?: string | null;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  job: ApplicationJobSummary;
  seekerId?: string;
  seeker?: ApplicationSeekerSummary;
  coverNote?: string | null;
  resumeUrl?: string | null;
  status: ApplicationStatus;
  history?: ApplicationHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplyJobInput {
  jobId: string;
  coverNote?: string | null;
  resumeUrl?: string | null;
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus;
  note?: string | null;
}
