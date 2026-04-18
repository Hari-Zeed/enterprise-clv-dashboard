export type UserRole = 'admin' | 'user' | 'demo';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SafeUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
