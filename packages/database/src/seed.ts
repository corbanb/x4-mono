import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { users, projects, aiUsageLog } from "./schema";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding database...");

  // Clean existing data (in reverse dependency order)
  console.log("  Clearing existing data...");
  await db.delete(aiUsageLog);
  await db.delete(projects);
  await db.delete(users);

  // Create admin user
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@x4.dev",
      name: "Admin User",
      passwordHash: "hashed_password_placeholder",
      role: "admin",
      emailVerified: true,
    })
    .returning();

  console.log(`  Created admin user: ${admin.email} (${admin.id})`);

  // Create regular user
  const [regularUser] = await db
    .insert(users)
    .values({
      email: "user@x4.dev",
      name: "Regular User",
      passwordHash: "hashed_password_placeholder",
      role: "user",
      emailVerified: true,
    })
    .returning();

  console.log(`  Created regular user: ${regularUser.email} (${regularUser.id})`);

  // Create projects
  await db
    .insert(projects)
    .values([
      {
        ownerId: admin.id,
        name: "Admin's First Project",
        description: "A sample project created by the admin user.",
        status: "active",
      },
      {
        ownerId: regularUser.id,
        name: "User's Project",
        description: "A sample project created by a regular user.",
        status: "active",
      },
    ])
    .returning();

  console.log("  Created 2 projects");

  // Create sample AI usage log entries
  await db.insert(aiUsageLog).values([
    {
      userId: admin.id,
      model: "claude-sonnet-4-5-20250929",
      tokensUsed: 1500,
      estimatedCost: "0.004500",
      endpoint: "/api/ai/chat",
    },
    {
      userId: regularUser.id,
      model: "claude-haiku-4-5-20251001",
      tokensUsed: 500,
      estimatedCost: "0.000250",
      endpoint: "/api/ai/summarize",
    },
  ]);

  console.log("  Created 2 AI usage log entries");
  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
