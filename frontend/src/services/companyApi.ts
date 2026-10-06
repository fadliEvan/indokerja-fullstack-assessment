import { CreateJobInput, JobVacancy } from '../types/job.types';
import { Application, ApplicationHistory } from '../types/application.types';
import {
  CandidateApplication,
  CompanyJobVacancy,
  UpdateCandidateStatusInput
} from '../types/company.types';
import { apiClient } from './apiClient';

interface GetCompanyJobsResponse {
  jobs: CompanyJobVacancy[];
}

interface CreateJobResponse {
  job: JobVacancy;
}

interface GetJobCandidatesResponse {
  candidates: CandidateApplication[];
}

interface UpdateStatusResponse {
  application: Application;
}

interface GetHistoryResponse {
  history: ApplicationHistory[];
}

export const companyApi = {
  /**
   * Retrieves all vacancies created by the authenticated company
   */
  async getCompanyJobs(): Promise<CompanyJobVacancy[]> {
    const res = await apiClient.get<GetCompanyJobsResponse>('/api/company/my-jobs');
    return res.jobs;
  },

  /**
   * Creates a new job vacancy under the authenticated company
   */
  async createJob(payload: CreateJobInput): Promise<JobVacancy> {
    const res = await apiClient.post<CreateJobResponse>('/api/company/jobs', payload);
    return res.job;
  },

  /**
   * Retrieves candidate applications for a specific company vacancy
   */
  async getJobCandidates(jobId: string): Promise<CandidateApplication[]> {
    const res = await apiClient.get<GetJobCandidatesResponse>(`/api/company/jobs/${jobId}/candidates`);
    return res.candidates;
  },

  /**
   * Updates an applicant's status with an optional review note
   */
  async updateCandidateStatus(
    applicationId: string,
    payload: UpdateCandidateStatusInput
  ): Promise<Application> {
    const res = await apiClient.patch<UpdateStatusResponse>(
      `/api/company/applications/${applicationId}/status`,
      payload
    );
    return res.application;
  },

  /**
   * Retrieves chronological audit history timeline for a candidate's application
   */
  async getApplicationHistory(applicationId: string): Promise<ApplicationHistory[]> {
    const res = await apiClient.get<GetHistoryResponse>(
      `/api/company/applications/${applicationId}/history`
    );
    return res.history;
  }
};
