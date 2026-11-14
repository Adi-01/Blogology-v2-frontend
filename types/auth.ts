export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string | null;
  planId: string;
  hasOnboarded: boolean;
  bio?: string | null;
  createdAt?: string;
}

export interface UserSessionView {
  id: string;
  deviceLabel: string | null;
  ipHint: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export type AuthResponse = AuthUser;

export interface ActionState<T = unknown> {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
  fields?: Record<string, string>;
}

