import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/db';
import { ConflictError, UnauthorizedError } from '../errors/AppError';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { generateToken } from '../utils/token';
import { SanitizedUser, SanitizedCompanyProfile } from '../types/auth.types';

export class AuthService {
  /**
   * Sanitizes user record, strictly stripping passwordHash.
   */
  private sanitizeUser(user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    role: Role;
    createdAt: Date;
    companyProfile?: {
      id: string;
      companyName: string;
      industry: string | null;
      location: string | null;
      description: string | null;
      website: string | null;
    } | null;
  }): SanitizedUser {
    let companyProfile: SanitizedCompanyProfile | null = null;

    if (user.companyProfile) {
      companyProfile = {
        id: user.companyProfile.id,
        companyName: user.companyProfile.companyName,
        industry: user.companyProfile.industry,
        location: user.companyProfile.location,
        description: user.companyProfile.description,
        website: user.companyProfile.website
      };
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      companyProfile,
      createdAt: user.createdAt
    };
  }

  /**
   * Register a new user (Seeker or Company).
   * For Company, atomically creates User + CompanyProfile inside a transaction.
   */
  async register(input: RegisterInput): Promise<{ user: SanitizedUser; token: string }> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() }
    });

    if (existing) {
      throw new ConflictError('Email is already registered', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const email = input.email.toLowerCase();

    if (input.role === Role.JOB_SEEKER) {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: input.fullName,
          phone: input.phone || null,
          role: Role.JOB_SEEKER
        }
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        user: this.sanitizeUser(user),
        token
      };
    }

    // Company Registration (Atomic Prisma Transaction)
    const { user, profile } = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: input.fullName,
          phone: input.phone || null,
          role: Role.COMPANY
        }
      });

      const createdProfile = await tx.companyProfile.create({
        data: {
          userId: createdUser.id,
          companyName: input.companyName!,
          industry: input.industry || null,
          location: input.location || null,
          description: input.description || null,
          website: input.website || null
        }
      });

      return { user: createdUser, profile: createdProfile };
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyProfileId: profile.id
    });

    return {
      user: this.sanitizeUser({ ...user, companyProfile: profile }),
      token
    };
  }

  /**
   * Log in user with email and password.
   */
  async login(input: LoginInput): Promise<{ user: SanitizedUser; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { companyProfile: true }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyProfileId: user.companyProfile?.id
    });

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  /**
   * Resolves session by user id.
   */
  async getCurrentUser(userId: string): Promise<SanitizedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true }
    });

    if (!user) {
      throw new UnauthorizedError('User session is invalid or user no longer exists', 'UNAUTHORIZED');
    }

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
