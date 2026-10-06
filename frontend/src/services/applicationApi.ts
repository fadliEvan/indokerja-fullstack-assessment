import { Application, ApplyJobInput } from '../types/application.types';
import { apiClient } from './apiClient';

interface ApplyResponse {
  application: Application;
}

interface GetApplicationsResponse {
  applications: Application[];
}

interface GetApplicationByIdResponse {
  application: Application;
}

export const applicationApi = {
  /**
   * Submits a job application for the authenticated Job Seeker
   */
  async applyForJob(input: ApplyJobInput): Promise<Application> {
    const res = await apiClient.post<ApplyResponse>('/api/applications/apply', input);
    return res.application;
  },

  /**
   * Retrieves all applications submitted by the current authenticated Job Seeker
   */
  async getMyApplications(): Promise<Application[]> {
    const res = await apiClient.get<GetApplicationsResponse>('/api/applications/my-applications');
    return res.applications;
  },

  /**
   * Retrieves detailed application view with timeline history for the authenticated Job Seeker
   */
  async getMyApplicationById(id: string): Promise<Application> {
    const res = await apiClient.get<GetApplicationByIdResponse>(`/api/applications/${id}`);
    return res.application;
  }
};
