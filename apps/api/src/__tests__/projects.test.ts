import { describe, test, expect } from "bun:test";
import { createCallerFactory } from "../trpc";
import { appRouter } from "../routers";
import type { Context } from "../trpc";
import {
  createMockDb,
  TEST_USER_ID,
  TEST_PROJECT_ID,
  OTHER_USER_ID,
  testProject,
  testProjectWithOwner,
} from "./helpers";

// --- Helpers ---

function createTestContext(overrides: Partial<Context> = {}): Context {
  return {
    db: createMockDb(),
    user: null,
    req: new Request("http://localhost:3002"),
    ...overrides,
  };
}

const createCaller = createCallerFactory(appRouter);

// --- projects.list ---

describe("projects.list", () => {
  test("returns paginated projects with total count", async () => {
    const db = createMockDb({
      select: [[testProject], [{ count: 1 }]],
    });
    const caller = createCaller(createTestContext({ db }));

    const result = await caller.projects.list({ limit: 20, offset: 0 });

    expect(result.items).toEqual([testProject]);
    expect(result.total).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  test("applies default pagination", async () => {
    const db = createMockDb({
      select: [[], [{ count: 0 }]],
    });
    const caller = createCaller(createTestContext({ db }));

    const result = await caller.projects.list({});

    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  test("rejects invalid pagination input", async () => {
    const caller = createCaller(createTestContext());

    await expect(
      caller.projects.list({ limit: 20, offset: -1 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// --- projects.get ---

describe("projects.get", () => {
  test("returns project with owner details", async () => {
    const db = createMockDb({ select: [[testProjectWithOwner]] });
    const caller = createCaller(
      createTestContext({
        db,
        user: { userId: TEST_USER_ID, role: "user" },
      }),
    );

    const result = await caller.projects.get({ id: TEST_PROJECT_ID });

    expect(result).toEqual(testProjectWithOwner);
    expect(result.ownerName).toBe("Test User");
    expect(result.ownerEmail).toBe("user@test.com");
  });

  test("throws NOT_FOUND for missing project", async () => {
    const db = createMockDb({ select: [[]] });
    const caller = createCaller(
      createTestContext({
        db,
        user: { userId: TEST_USER_ID, role: "user" },
      }),
    );

    await expect(
      caller.projects.get({ id: TEST_PROJECT_ID }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  test("rejects unauthenticated request", async () => {
    const caller = createCaller(createTestContext({ user: null }));

    await expect(
      caller.projects.get({ id: TEST_PROJECT_ID }),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

// --- projects.create ---

describe("projects.create", () => {
  test("creates project with user as owner", async () => {
    const createdProject = { ...testProject, ownerId: TEST_USER_ID };
    const db = createMockDb({ insert: [createdProject] });
    const caller = createCaller(
      createTestContext({
        db,
        user: { userId: TEST_USER_ID, role: "user" },
      }),
    );

    const result = await caller.projects.create({
      name: "Test Project",
      description: "A test project",
    });

    expect(result).toEqual(createdProject);
  });

  test("rejects invalid input (empty name)", async () => {
    const caller = createCaller(
      createTestContext({
        user: { userId: TEST_USER_ID, role: "user" },
      }),
    );

    await expect(
      caller.projects.create({ name: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// --- projects.update ---

describe("projects.update", () => {
  test("allows owner to update own project", async () => {
    const updatedProject = { ...testProject, name: "Updated Name" };
    const db = createMockDb({
      select: [[{ ownerId: TEST_USER_ID }]],
      update: [updatedProject],
    });
    const caller = createCaller(
      createTestContext({
        db,
        user: { userId: TEST_USER_ID, role: "user" },
      }),
    );

    const result = await caller.projects.update({
      id: TEST_PROJECT_ID,
      name: "Updated Name",
    });

    expect(result).toEqual(updatedProject);
  });

  test("throws FORBIDDEN for non-owner", async () => {
    const db = createMockDb({
      select: [[{ ownerId: OTHER_USER_ID }]],
    });
    const caller = createCaller(
      createTestContext({
        db,
        user: { userId: TEST_USER_ID, role: "user" },
      }),
    );

    await expect(
      caller.projects.update({ id: TEST_PROJECT_ID, name: "Nope" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  test("throws NOT_FOUND on update of missing project", async () => {
    const db = createMockDb({ select: [[]] });
    const caller = createCaller(
      createTestContext({
        db,
        user: { userId: TEST_USER_ID, role: "user" },
      }),
    );

    await expect(
      caller.projects.update({ id: TEST_PROJECT_ID, name: "Nope" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

// --- projects.delete ---

describe("projects.delete", () => {
  test("throws FORBIDDEN on delete by non-owner", async () => {
    const db = createMockDb({
      select: [[{ ownerId: OTHER_USER_ID }]],
    });
    const caller = createCaller(
      createTestContext({
        db,
        user: { userId: TEST_USER_ID, role: "user" },
      }),
    );

    await expect(
      caller.projects.delete({ id: TEST_PROJECT_ID }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
