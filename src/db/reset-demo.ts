import { config } from "dotenv";

config({ path: ".env.local" });

import { inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  approvals,
  clientInvitations,
  clients,
  feedback,
  milestones,
  payments,
  profiles,
  projectActivity,
  projectAssignments,
  projectFiles,
  projects,
  projectUpdates,
  projectViewEvents,
  tasks,
  workspaces,
} from "@/db/schema";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL");
}

const client = postgres(connectionString, {
  prepare: false,
});

const db = drizzle(client);

const demoProjectSlugs = [
  "demo-website-redesign",
  "demo-saas-dashboard-mvp",
  "demo-ai-support-workflow",
];

function getDemoEmail(name: "DEMO_OWNER_EMAIL" | "DEMO_CLIENT_EMAIL") {
  return process.env[name]?.trim().toLowerCase();
}

const demoProfileEmails = [
  getDemoEmail("DEMO_OWNER_EMAIL"),
  getDemoEmail("DEMO_CLIENT_EMAIL"),
].filter((email): email is string => Boolean(email));

async function main() {
  console.log("Resetting DeliverFlow demo data...");

  const profileRowsPromise =
    demoProfileEmails.length === 0
      ? Promise.resolve([])
      : db
          .select({ id: profiles.id })
          .from(profiles)
          .where(inArray(profiles.email, demoProfileEmails));

  const [projectRows, clientRows, profileRows] = await Promise.all([
    db
      .select({ id: projects.id })
      .from(projects)
      .where(inArray(projects.slug, demoProjectSlugs)),
    db
      .select({ id: clients.id })
      .from(clients)
      .where(like(clients.email, "%@deliverflow.demo")),
    profileRowsPromise,
  ]);

  const projectIds = projectRows.map((row) => row.id);
  const clientIds = clientRows.map((row) => row.id);
  const profileIds = profileRows.map((row) => row.id);

  if (projectIds.length > 0 || clientIds.length > 0 || profileIds.length > 0) {
    if (projectIds.length > 0) {
      await db
        .delete(projectViewEvents)
        .where(inArray(projectViewEvents.projectId, projectIds));
      await db
        .delete(projectActivity)
        .where(inArray(projectActivity.projectId, projectIds));
      await db
        .delete(projectFiles)
        .where(inArray(projectFiles.projectId, projectIds));
      await db.delete(payments).where(inArray(payments.projectId, projectIds));
      await db
        .delete(approvals)
        .where(inArray(approvals.projectId, projectIds));
      await db.delete(feedback).where(inArray(feedback.projectId, projectIds));
      await db
        .delete(projectUpdates)
        .where(inArray(projectUpdates.projectId, projectIds));
      await db.delete(tasks).where(inArray(tasks.projectId, projectIds));
      await db
        .delete(milestones)
        .where(inArray(milestones.projectId, projectIds));
      await db
        .delete(projectAssignments)
        .where(inArray(projectAssignments.projectId, projectIds));
      await db.delete(projects).where(inArray(projects.id, projectIds));
    }

    if (clientIds.length > 0) {
      await db
        .delete(projectViewEvents)
        .where(inArray(projectViewEvents.clientId, clientIds));
      await db.delete(feedback).where(inArray(feedback.clientId, clientIds));
      await db
        .delete(projectAssignments)
        .where(inArray(projectAssignments.clientId, clientIds));
      await db
        .delete(clientInvitations)
        .where(inArray(clientInvitations.clientId, clientIds));
      await db.delete(clients).where(inArray(clients.id, clientIds));
    }

    if (profileIds.length > 0) {
      await db.delete(profiles).where(inArray(profiles.id, profileIds));
    }
  }

  await db.delete(workspaces).where(like(workspaces.slug, "deliverflow-demo"));

  console.log(
    `Removed ${projectIds.length} demo projects, ${clientIds.length} demo clients, and ${profileIds.length} demo profiles.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
