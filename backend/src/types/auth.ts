import { Request } from 'express';

export type User = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

export type AuthSession = {
  accessToken: string;
  user: User;
};

export type EmailCredentials = {
  email: string;
  password: string;
};

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  userId?: string;
  auth?: any;
}
