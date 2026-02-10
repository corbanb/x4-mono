import { z } from "zod";

// --- User Schemas ---
export const UserRoleSchema = z.enum(["user", "admin"]);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: UserRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: UserRoleSchema.default("user"),
});

// --- Project Schemas ---
export const ProjectStatusSchema = z.enum(["active", "archived"]);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  status: ProjectStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});

export const UpdateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: ProjectStatusSchema.optional(),
});

// --- Pagination ---
export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// --- ID Params ---
export const IdParamSchema = z.object({
  id: z.string().uuid(),
});

// --- Output Schemas (for OpenAPI) ---

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Matches Drizzle return types: status is string, description is nullable */
export const ProjectResponseSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProjectWithOwnerSchema = ProjectResponseSchema.extend({
  ownerName: z.string(),
  ownerEmail: z.string().email(),
});

export const ProjectListResponseSchema = z.object({
  items: z.array(ProjectResponseSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
});

// --- Inferred Types ---
export type UserInput = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ProjectWithOwner = z.infer<typeof ProjectWithOwnerSchema>;
export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>;
