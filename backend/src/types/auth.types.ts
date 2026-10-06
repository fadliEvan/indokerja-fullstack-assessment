import { Role } from '@prisma/client';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: Role;
  companyProfileId?: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  companyProfileId?: string;
}

export interface SanitizedCompanyProfile {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  description: string | null;
  website: string | null;
}

export interface SanitizedUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
  companyProfile?: SanitizedCompanyProfile | null;
  createdAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
