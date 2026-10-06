import { LoginInput, RegisterInput, User } from '../types/auth.types';
import { apiClient } from './apiClient';

interface AuthResponse {
  user: User;
}

export const authApi = {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginInput): Promise<User> {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return res.user;
  },

  /**
   * Register a new Job Seeker or Company account
   */
  async register(payload: RegisterInput): Promise<User> {
    const res = await apiClient.post<AuthResponse>('/api/auth/register', payload);
    return res.user;
  },

  /**
   * Fetch current authenticated user session via HTTP-only cookie
   */
  async getMe(): Promise<User> {
    const res = await apiClient.get<AuthResponse>('/api/auth/me');
    return res.user;
  },

  /**
   * Invalidate session and clear HTTP-only auth cookie
   */
  async logout(): Promise<void> {
    await apiClient.post<null>('/api/auth/logout');
  }
};
