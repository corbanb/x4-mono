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
