export const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";
export const TEST_ADMIN_ID = "22222222-2222-2222-2222-222222222222";
export const TEST_PROJECT_ID = "33333333-3333-3333-3333-333333333333";
export const OTHER_USER_ID = "44444444-4444-4444-4444-444444444444";

const now = new Date("2025-01-01T00:00:00Z");

export const testUser = {
  id: TEST_USER_ID,
  email: "user@test.com",
  name: "Test User",
  role: "user" as const,
  emailVerified: false,
  createdAt: now,
  updatedAt: now,
};

export const testAdmin = {
  id: TEST_ADMIN_ID,
  email: "admin@test.com",
  name: "Test Admin",
  role: "admin" as const,
  emailVerified: true,
  createdAt: now,
  updatedAt: now,
};

export const testProject = {
  id: TEST_PROJECT_ID,
  ownerId: TEST_USER_ID,
  name: "Test Project",
  description: "A test project",
  status: "active",
  createdAt: now,
  updatedAt: now,
};

export const testProjectWithOwner = {
  id: TEST_PROJECT_ID,
  ownerId: TEST_USER_ID,
  name: "Test Project",
  description: "A test project",
  status: "active",
  createdAt: now,
  updatedAt: now,
  ownerName: "Test User",
  ownerEmail: "user@test.com",
};
