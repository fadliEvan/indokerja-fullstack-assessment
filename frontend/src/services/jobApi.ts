import { JobVacancy, JobQueryInput } from '../types/job.types';
import { apiClient } from './apiClient';

interface GetJobsResponse {
  jobs: JobVacancy[];
}

interface GetJobByIdResponse {
  job: JobVacancy;
}

export const jobApi = {
  /**
   * Retrieves public open job vacancies with optional query filters
   */
  async getJobs(params?: JobQueryInput): Promise<JobVacancy[]> {
    const res = await apiClient.get<GetJobsResponse>('/api/jobs', {
      params: {
        keyword: params?.keyword,
        jobType: params?.jobType,
        location: params?.location
      }
    });
    return res.jobs;
  },

  /**
   * Retrieves single public job vacancy details.
   * If authenticated, includes hasApplied and userApplicationStatus.
   */
  async getJobById(id: string): Promise<JobVacancy> {
    const res = await apiClient.get<GetJobByIdResponse>(`/api/jobs/${id}`);
    return res.job;
  }
};
