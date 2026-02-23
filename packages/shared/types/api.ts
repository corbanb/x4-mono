import type { User, Project } from './domain';

export type GetUserRequest = { userId: string };
export type GetUserResponse = User;

export type CreateProjectRequest = {
  name: string;
  description?: string;
};
export type CreateProjectResponse = Project;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};
