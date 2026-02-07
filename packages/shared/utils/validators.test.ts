import { describe, test, expect } from "bun:test";
import {
  UserRoleSchema,
  UserSchema,
  CreateUserSchema,
  ProjectStatusSchema,
  ProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  PaginationSchema,
  IdParamSchema,
} from "./validators";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID_2 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const NOW = new Date();

// --- UserRoleSchema ---
describe("UserRoleSchema", () => {
  test("accepts 'user'", () => {
    expect(UserRoleSchema.safeParse("user").success).toBe(true);
  });

  test("accepts 'admin'", () => {
    expect(UserRoleSchema.safeParse("admin").success).toBe(true);
  });

  test("rejects empty string", () => {
    expect(UserRoleSchema.safeParse("").success).toBe(false);
  });

  test("rejects unknown role", () => {
    expect(UserRoleSchema.safeParse("superadmin").success).toBe(false);
  });

  test("rejects number", () => {
    expect(UserRoleSchema.safeParse(1).success).toBe(false);
  });

  test("rejects null", () => {
    expect(UserRoleSchema.safeParse(null).success).toBe(false);
  });

  test("rejects undefined", () => {
    expect(UserRoleSchema.safeParse(undefined).success).toBe(false);
  });
});

// --- UserSchema ---
describe("UserSchema", () => {
  const validUser = {
    id: VALID_UUID,
    email: "test@example.com",
    name: "Test User",
    role: "user" as const,
    createdAt: NOW,
    updatedAt: NOW,
  };

  test("accepts valid user with all fields", () => {
    expect(UserSchema.safeParse(validUser).success).toBe(true);
  });

  test("rejects missing id", () => {
    const { id, ...rest } = validUser;
    expect(UserSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects invalid uuid for id", () => {
    expect(UserSchema.safeParse({ ...validUser, id: "not-a-uuid" }).success).toBe(false);
  });

  test("rejects missing email", () => {
    const { email, ...rest } = validUser;
    expect(UserSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects invalid email", () => {
    expect(UserSchema.safeParse({ ...validUser, email: "not-an-email" }).success).toBe(false);
  });

  test("rejects empty string for name", () => {
    expect(UserSchema.safeParse({ ...validUser, name: "" }).success).toBe(false);
  });

  test("rejects name exceeding 255 characters", () => {
    expect(UserSchema.safeParse({ ...validUser, name: "a".repeat(256) }).success).toBe(false);
  });

  test("accepts name with exactly 1 character", () => {
    expect(UserSchema.safeParse({ ...validUser, name: "a" }).success).toBe(true);
  });

  test("accepts name with exactly 255 characters", () => {
    expect(UserSchema.safeParse({ ...validUser, name: "a".repeat(255) }).success).toBe(true);
  });

  test("rejects invalid role", () => {
    expect(UserSchema.safeParse({ ...validUser, role: "superadmin" }).success).toBe(false);
  });

  test("rejects missing createdAt", () => {
    const { createdAt, ...rest } = validUser;
    expect(UserSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects non-Date for createdAt", () => {
    expect(UserSchema.safeParse({ ...validUser, createdAt: "2024-01-01" }).success).toBe(false);
  });

  test("rejects non-Date for updatedAt", () => {
    expect(UserSchema.safeParse({ ...validUser, updatedAt: 12345 }).success).toBe(false);
  });
});

// --- CreateUserSchema ---
describe("CreateUserSchema", () => {
  const validInput = {
    email: "test@example.com",
    name: "Test User",
    role: "user" as const,
  };

  test("accepts valid input with all fields", () => {
    expect(CreateUserSchema.safeParse(validInput).success).toBe(true);
  });

  test("accepts input without role — defaults to 'user'", () => {
    const { role, ...rest } = validInput;
    const result = CreateUserSchema.parse(rest);
    expect(result.role).toBe("user");
  });

  test("accepts role 'admin' explicitly", () => {
    expect(CreateUserSchema.safeParse({ ...validInput, role: "admin" }).success).toBe(true);
  });

  test("rejects missing email", () => {
    const { email, ...rest } = validInput;
    expect(CreateUserSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects invalid email", () => {
    expect(CreateUserSchema.safeParse({ ...validInput, email: "bad" }).success).toBe(false);
  });

  test("rejects missing name", () => {
    const { name, ...rest } = validInput;
    expect(CreateUserSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects empty name", () => {
    expect(CreateUserSchema.safeParse({ ...validInput, name: "" }).success).toBe(false);
  });

  test("rejects name over 255 chars", () => {
    expect(CreateUserSchema.safeParse({ ...validInput, name: "a".repeat(256) }).success).toBe(
      false,
    );
  });

  test("rejects invalid role value", () => {
    expect(CreateUserSchema.safeParse({ ...validInput, role: "superadmin" }).success).toBe(false);
  });
});

// --- ProjectStatusSchema ---
describe("ProjectStatusSchema", () => {
  test("accepts 'active'", () => {
    expect(ProjectStatusSchema.safeParse("active").success).toBe(true);
  });

  test("accepts 'archived'", () => {
    expect(ProjectStatusSchema.safeParse("archived").success).toBe(true);
  });

  test("rejects 'deleted'", () => {
    expect(ProjectStatusSchema.safeParse("deleted").success).toBe(false);
  });

  test("rejects empty string", () => {
    expect(ProjectStatusSchema.safeParse("").success).toBe(false);
  });

  test("rejects number", () => {
    expect(ProjectStatusSchema.safeParse(1).success).toBe(false);
  });
});

// --- ProjectSchema ---
describe("ProjectSchema", () => {
  const validProject = {
    id: VALID_UUID,
    ownerId: VALID_UUID_2,
    name: "My Project",
    description: "A test project",
    status: "active" as const,
    createdAt: NOW,
    updatedAt: NOW,
  };

  test("accepts valid project with all fields", () => {
    expect(ProjectSchema.safeParse(validProject).success).toBe(true);
  });

  test("accepts valid project without description", () => {
    const { description, ...rest } = validProject;
    expect(ProjectSchema.safeParse(rest).success).toBe(true);
  });

  test("rejects invalid uuid for id", () => {
    expect(ProjectSchema.safeParse({ ...validProject, id: "bad" }).success).toBe(false);
  });

  test("rejects invalid uuid for ownerId", () => {
    expect(ProjectSchema.safeParse({ ...validProject, ownerId: "bad" }).success).toBe(false);
  });

  test("rejects empty name", () => {
    expect(ProjectSchema.safeParse({ ...validProject, name: "" }).success).toBe(false);
  });

  test("rejects name over 255 chars", () => {
    expect(ProjectSchema.safeParse({ ...validProject, name: "a".repeat(256) }).success).toBe(
      false,
    );
  });

  test("accepts description at exactly 1000 chars", () => {
    expect(
      ProjectSchema.safeParse({ ...validProject, description: "a".repeat(1000) }).success,
    ).toBe(true);
  });

  test("rejects description over 1000 chars", () => {
    expect(
      ProjectSchema.safeParse({ ...validProject, description: "a".repeat(1001) }).success,
    ).toBe(false);
  });

  test("rejects invalid status", () => {
    expect(ProjectSchema.safeParse({ ...validProject, status: "deleted" }).success).toBe(false);
  });

  test("rejects missing createdAt", () => {
    const { createdAt, ...rest } = validProject;
    expect(ProjectSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects missing updatedAt", () => {
    const { updatedAt, ...rest } = validProject;
    expect(ProjectSchema.safeParse(rest).success).toBe(false);
  });
});

// --- CreateProjectSchema ---
describe("CreateProjectSchema", () => {
  test("accepts valid input with name only", () => {
    expect(CreateProjectSchema.safeParse({ name: "My Project" }).success).toBe(true);
  });

  test("accepts valid input with name and description", () => {
    expect(CreateProjectSchema.safeParse({ name: "My Project", description: "Desc" }).success).toBe(
      true,
    );
  });

  test("rejects missing name", () => {
    expect(CreateProjectSchema.safeParse({}).success).toBe(false);
  });

  test("rejects empty name", () => {
    expect(CreateProjectSchema.safeParse({ name: "" }).success).toBe(false);
  });

  test("rejects name over 255 chars", () => {
    expect(CreateProjectSchema.safeParse({ name: "a".repeat(256) }).success).toBe(false);
  });

  test("accepts description at 1000 chars", () => {
    expect(
      CreateProjectSchema.safeParse({ name: "Test", description: "a".repeat(1000) }).success,
    ).toBe(true);
  });

  test("rejects description over 1000 chars", () => {
    expect(
      CreateProjectSchema.safeParse({ name: "Test", description: "a".repeat(1001) }).success,
    ).toBe(false);
  });

  test("accepts undefined description", () => {
    expect(CreateProjectSchema.safeParse({ name: "Test", description: undefined }).success).toBe(
      true,
    );
  });
});

// --- UpdateProjectSchema ---
describe("UpdateProjectSchema", () => {
  test("accepts valid input with all optional fields", () => {
    expect(
      UpdateProjectSchema.safeParse({
        id: VALID_UUID,
        name: "Updated",
        description: "Updated desc",
        status: "archived",
      }).success,
    ).toBe(true);
  });

  test("accepts input with only id", () => {
    expect(UpdateProjectSchema.safeParse({ id: VALID_UUID }).success).toBe(true);
  });

  test("accepts input with id and name only", () => {
    expect(UpdateProjectSchema.safeParse({ id: VALID_UUID, name: "New Name" }).success).toBe(true);
  });

  test("accepts input with id and status only", () => {
    expect(
      UpdateProjectSchema.safeParse({ id: VALID_UUID, status: "archived" }).success,
    ).toBe(true);
  });

  test("rejects missing id", () => {
    expect(UpdateProjectSchema.safeParse({ name: "Test" }).success).toBe(false);
  });

  test("rejects invalid uuid for id", () => {
    expect(UpdateProjectSchema.safeParse({ id: "bad" }).success).toBe(false);
  });

  test("rejects empty name when provided", () => {
    expect(UpdateProjectSchema.safeParse({ id: VALID_UUID, name: "" }).success).toBe(false);
  });

  test("rejects name over 255 chars when provided", () => {
    expect(
      UpdateProjectSchema.safeParse({ id: VALID_UUID, name: "a".repeat(256) }).success,
    ).toBe(false);
  });

  test("rejects description over 1000 chars when provided", () => {
    expect(
      UpdateProjectSchema.safeParse({ id: VALID_UUID, description: "a".repeat(1001) }).success,
    ).toBe(false);
  });

  test("rejects invalid status when provided", () => {
    expect(
      UpdateProjectSchema.safeParse({ id: VALID_UUID, status: "deleted" }).success,
    ).toBe(false);
  });
});

// --- PaginationSchema ---
describe("PaginationSchema", () => {
  test("accepts valid limit and offset", () => {
    expect(PaginationSchema.safeParse({ limit: 10, offset: 5 }).success).toBe(true);
  });

  test("applies default limit=20 when omitted", () => {
    const result = PaginationSchema.parse({ offset: 0 });
    expect(result.limit).toBe(20);
  });

  test("applies default offset=0 when omitted", () => {
    const result = PaginationSchema.parse({ limit: 10 });
    expect(result.offset).toBe(0);
  });

  test("applies both defaults when empty object", () => {
    const result = PaginationSchema.parse({});
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  test("accepts limit=1 (minimum)", () => {
    expect(PaginationSchema.safeParse({ limit: 1 }).success).toBe(true);
  });

  test("accepts limit=100 (maximum)", () => {
    expect(PaginationSchema.safeParse({ limit: 100 }).success).toBe(true);
  });

  test("rejects limit=0", () => {
    expect(PaginationSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  test("rejects limit=101", () => {
    expect(PaginationSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  test("rejects negative limit", () => {
    expect(PaginationSchema.safeParse({ limit: -1 }).success).toBe(false);
  });

  test("rejects negative offset", () => {
    expect(PaginationSchema.safeParse({ offset: -1 }).success).toBe(false);
  });

  test("rejects non-integer limit", () => {
    expect(PaginationSchema.safeParse({ limit: 10.5 }).success).toBe(false);
  });

  test("rejects non-integer offset", () => {
    expect(PaginationSchema.safeParse({ offset: 1.7 }).success).toBe(false);
  });
});

// --- IdParamSchema ---
describe("IdParamSchema", () => {
  test("accepts valid uuid", () => {
    expect(IdParamSchema.safeParse({ id: VALID_UUID }).success).toBe(true);
  });

  test("rejects empty string", () => {
    expect(IdParamSchema.safeParse({ id: "" }).success).toBe(false);
  });

  test("rejects non-uuid string", () => {
    expect(IdParamSchema.safeParse({ id: "not-a-uuid" }).success).toBe(false);
  });

  test("rejects missing id", () => {
    expect(IdParamSchema.safeParse({}).success).toBe(false);
  });

  test("rejects number for id", () => {
    expect(IdParamSchema.safeParse({ id: 123 }).success).toBe(false);
  });
});
