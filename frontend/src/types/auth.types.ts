export type Role = 'JOB_SEEKER' | 'COMPANY';

export interface CompanyProfile {
  id: string;
  userId?: string;
  companyName: string;
  industry?: string | null;
  location?: string | null;
  description?: string | null;
  website?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: Role;
  companyProfile?: CompanyProfile | null;
  createdAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  companyName?: string;
  industry?: string;
  location?: string;
  description?: string;
  website?: string;
}
