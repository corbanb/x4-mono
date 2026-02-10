import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// --- Enums ---
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// --- Tables ---
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  role: userRoleEnum("role").default("user").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull()
    .$onUpdate(() => new Date()),
});

// Better Auth expects a `user` model by default. Reuse the existing `users` table.
export const user = users;

export const session = pgTable(
  "session",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()::text`),
    expiresAt: timestamp("expires_at").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`now()`)
      .notNull()
      .$onUpdate(() => new Date()),
    ipAddress: varchar("ip_address", { length: 255 }),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("idx_session_user_id").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()::text`),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`now()`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_account_user_id").on(table.userId),
    index("idx_account_provider").on(table.providerId, table.accountId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()::text`),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
  },
  (table) => [index("idx_verification_identifier").on(table.identifier)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`now()`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_projects_owner_id").on(table.ownerId),
    index("idx_projects_status").on(table.status),
  ],
);

export const aiUsageLog = pgTable(
  "ai_usage_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    model: varchar("model", { length: 100 }).notNull(),
    tokensUsed: integer("tokens_used").notNull(),
    estimatedCost: numeric("estimated_cost", { precision: 10, scale: 6 }),
    endpoint: varchar("endpoint", { length: 255 }),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (table) => [
    index("idx_ai_usage_user_id").on(table.userId),
    index("idx_ai_usage_created").on(table.createdAt),
  ],
);

// --- Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  aiUsage: many(aiUsageLog),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
}));

export const aiUsageLogRelations = relations(aiUsageLog, ({ one }) => ({
  user: one(users, { fields: [aiUsageLog.userId], references: [users.id] }),
}));

// --- pgvector Template (uncomment when needed) ---
// import { vector } from "drizzle-orm/pg-core";
//
// export const embeddings = pgTable(
//   "embeddings",
//   {
//     id: uuid("id").primaryKey().defaultRandom(),
//     content: text("content").notNull(),
//     embedding: vector("embedding", { dimensions: 1536 }),
//     metadata: text("metadata"),
//     createdAt: timestamp("created_at").default(sql`now()`).notNull(),
//   },
//   (table) => [
//     // Note: requires `CREATE EXTENSION IF NOT EXISTS vector;`
//   ]
// );
