import { config } from "dotenv";

config({ path: ".env.local" });

import { count, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  adminNotes,
  approvals,
  clients,
  feedback,
  milestones,
  notifications,
  payments,
  profiles,
  projectActivity,
  projectAssignments,
  projects,
  projectUpdates,
  tasks,
  workspaces,
} from "@/db/schema";

const email = process.env.SCREENSHOT_SEED_EMAIL?.trim().toLowerCase();
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!email) {
  throw new Error("Missing SCREENSHOT_SEED_EMAIL.");
}

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL.");
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

const ids = {
  clients: {
    northstar: "a1000000-0000-4000-8000-000000000001",
    atelier: "a1000000-0000-4000-8000-000000000002",
    canopy: "a1000000-0000-4000-8000-000000000003",
  },
  projects: {
    launch: "a2000000-0000-4000-8000-000000000001",
    operations: "a2000000-0000-4000-8000-000000000002",
    brand: "a2000000-0000-4000-8000-000000000003",
    analytics: "a2000000-0000-4000-8000-000000000004",
  },
  milestones: {
    launchDirection: "a3000000-0000-4000-8000-000000000001",
    launchReview: "a3000000-0000-4000-8000-000000000002",
    operationsFoundation: "a3000000-0000-4000-8000-000000000003",
    operationsIntegration: "a3000000-0000-4000-8000-000000000004",
    brandHandoff: "a3000000-0000-4000-8000-000000000005",
  },
  tasks: {
    messaging: "a4000000-0000-4000-8000-000000000001",
    review: "a4000000-0000-4000-8000-000000000002",
    qa: "a4000000-0000-4000-8000-000000000003",
    reporting: "a4000000-0000-4000-8000-000000000004",
    automation: "a4000000-0000-4000-8000-000000000005",
    handoff: "a4000000-0000-4000-8000-000000000006",
  },
  updates: {
    launch: "a5000000-0000-4000-8000-000000000001",
    operations: "a5000000-0000-4000-8000-000000000002",
    brand: "a5000000-0000-4000-8000-000000000003",
  },
  approvals: {
    launch: "a6000000-0000-4000-8000-000000000001",
    operations: "a6000000-0000-4000-8000-000000000002",
  },
  feedback: {
    launch: "a7000000-0000-4000-8000-000000000001",
    operations: "a7000000-0000-4000-8000-000000000002",
  },
  payments: {
    launchDeposit: "a8000000-0000-4000-8000-000000000001",
    launchFinal: "a8000000-0000-4000-8000-000000000002",
    operationsDeposit: "a8000000-0000-4000-8000-000000000003",
    operationsMilestone: "a8000000-0000-4000-8000-000000000004",
  },
  activity: {
    launch: "a9000000-0000-4000-8000-000000000001",
    approval: "a9000000-0000-4000-8000-000000000002",
    operations: "a9000000-0000-4000-8000-000000000003",
    payment: "a9000000-0000-4000-8000-000000000004",
  },
  notes: {
    launch: "aa000000-0000-4000-8000-000000000001",
    operations: "aa000000-0000-4000-8000-000000000002",
  },
  notifications: {
    approval: "ab000000-0000-4000-8000-000000000001",
    payment: "ab000000-0000-4000-8000-000000000002",
  },
} as const;

async function main() {
  const [account] = await db
    .select({
      id: profiles.id,
      role: profiles.role,
      workspaceId: profiles.workspaceId,
      workspaceName: workspaces.name,
    })
    .from(profiles)
    .innerJoin(workspaces, eq(profiles.workspaceId, workspaces.id))
    .where(eq(profiles.email, email));

  if (!account) {
    throw new Error(`No DeliverFlow profile exists for ${email}.`);
  }

  if (account.role !== "owner") {
    throw new Error(`${email} is not an owner account.`);
  }

  const workspaceId = account.workspaceId;
  const ownerId = account.id;

  await db
    .insert(clients)
    .values([
      {
        id: ids.clients.northstar,
        workspaceId,
        companyName: "Northstar Labs",
        contactName: "Maya Chen",
        email: "maya@northstarlabs.example",
        phone: "+49 30 555 0141",
        status: "active",
        notes:
          "Product team preparing a focused launch for their new collaboration platform.",
        createdBy: ownerId,
      },
      {
        id: ids.clients.atelier,
        workspaceId,
        companyName: "Atelier & Co.",
        contactName: "Jonas Weber",
        email: "jonas@atelierco.example",
        phone: "+49 40 555 0178",
        status: "active",
        notes:
          "Growing services business centralising delivery, billing, and client updates.",
        createdBy: ownerId,
      },
      {
        id: ids.clients.canopy,
        workspaceId,
        companyName: "Canopy Insights",
        contactName: "Olivia Martin",
        email: "olivia@canopyinsights.example",
        phone: "+33 1 555 0123",
        status: "active",
        notes: "Analytics consultancy completing a polished reporting handoff.",
        createdBy: ownerId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(projects)
    .values([
      {
        id: ids.projects.launch,
        workspaceId,
        name: "Product Launch Platform",
        slug: "screenshot-skerdi-product-launch-platform",
        description:
          "A conversion-focused launch platform with clear product positioning, high-value pages, and a coordinated release plan.",
        status: "waiting_feedback",
        progress: 82,
        liveDemoUrl: "https://example.com/product-launch-preview",
        repositoryUrl: "https://github.com/example/product-launch-platform",
        deadline: "2026-07-24",
        createdBy: ownerId,
      },
      {
        id: ids.projects.operations,
        workspaceId,
        name: "Operations Hub",
        slug: "screenshot-skerdi-operations-hub",
        description:
          "An internal operations hub that brings client work, payment visibility, and delivery reporting into one clear workflow.",
        status: "in_progress",
        progress: 64,
        liveDemoUrl: "https://example.com/operations-hub-preview",
        repositoryUrl: "https://github.com/example/operations-hub",
        deadline: "2026-08-14",
        createdBy: ownerId,
      },
      {
        id: ids.projects.brand,
        workspaceId,
        name: "Brand System Refresh",
        slug: "screenshot-skerdi-brand-system-refresh",
        description:
          "A modular visual system and practical handoff package for a fast-growing consulting team.",
        status: "active",
        progress: 38,
        deadline: "2026-09-04",
        createdBy: ownerId,
      },
      {
        id: ids.projects.analytics,
        workspaceId,
        name: "Analytics Reporting Rollout",
        slug: "screenshot-skerdi-analytics-reporting-rollout",
        description:
          "Completed analytics reporting rollout with stakeholder dashboards and concise operating documentation.",
        status: "completed",
        progress: 100,
        deadline: "2026-06-20",
        createdBy: ownerId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(projectAssignments)
    .values([
      {
        workspaceId,
        projectId: ids.projects.launch,
        clientId: ids.clients.northstar,
        assignedBy: ownerId,
      },
      {
        workspaceId,
        projectId: ids.projects.operations,
        clientId: ids.clients.atelier,
        assignedBy: ownerId,
      },
      {
        workspaceId,
        projectId: ids.projects.brand,
        clientId: ids.clients.northstar,
        assignedBy: ownerId,
      },
      {
        workspaceId,
        projectId: ids.projects.analytics,
        clientId: ids.clients.canopy,
        assignedBy: ownerId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(milestones)
    .values([
      {
        id: ids.milestones.launchDirection,
        workspaceId,
        projectId: ids.projects.launch,
        title: "Launch direction",
        description:
          "Messaging, page hierarchy, and success metrics are approved.",
        status: "completed",
        dueDate: "2026-07-03",
        position: 1,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
      {
        id: ids.milestones.launchReview,
        workspaceId,
        projectId: ids.projects.launch,
        title: "Final design review",
        description:
          "Review launch-ready page designs before implementation closes.",
        status: "waiting_approval",
        dueDate: "2026-07-18",
        position: 2,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
      {
        id: ids.milestones.operationsFoundation,
        workspaceId,
        projectId: ids.projects.operations,
        title: "Workspace foundation",
        description:
          "Core navigation, dashboard structure, and project visibility are in place.",
        status: "completed",
        dueDate: "2026-07-08",
        position: 1,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
      {
        id: ids.milestones.operationsIntegration,
        workspaceId,
        projectId: ids.projects.operations,
        title: "Reporting integration",
        description:
          "Connect the decision-ready reporting views and automate key activity signals.",
        status: "in_progress",
        dueDate: "2026-07-30",
        position: 2,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
      {
        id: ids.milestones.brandHandoff,
        workspaceId,
        projectId: ids.projects.brand,
        title: "System handoff",
        description:
          "Prepare the reusable component library and implementation guidance.",
        status: "not_started",
        dueDate: "2026-08-21",
        position: 1,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(tasks)
    .values([
      {
        id: ids.tasks.messaging,
        workspaceId,
        projectId: ids.projects.launch,
        milestoneId: ids.milestones.launchDirection,
        title: "Finalize launch messaging",
        description:
          "Lock the product narrative and proof points for the final page pass.",
        status: "completed",
        priority: "high",
        dueDate: "2026-07-02",
        position: 1,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
      {
        id: ids.tasks.review,
        workspaceId,
        projectId: ids.projects.launch,
        milestoneId: ids.milestones.launchReview,
        title: "Collect stakeholder approval",
        description:
          "Confirm final designs and the release checklist with the client team.",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-07-18",
        position: 2,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
      {
        id: ids.tasks.qa,
        workspaceId,
        projectId: ids.projects.launch,
        milestoneId: ids.milestones.launchReview,
        title: "Run responsive QA",
        description:
          "Validate the launch pages across desktop, tablet, and mobile.",
        status: "todo",
        priority: "medium",
        dueDate: "2026-07-20",
        position: 3,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
      {
        id: ids.tasks.reporting,
        workspaceId,
        projectId: ids.projects.operations,
        milestoneId: ids.milestones.operationsIntegration,
        title: "Connect reporting data",
        description:
          "Complete the dashboard metrics and operational summary views.",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-07-25",
        position: 1,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
      {
        id: ids.tasks.automation,
        workspaceId,
        projectId: ids.projects.operations,
        milestoneId: ids.milestones.operationsIntegration,
        title: "Configure activity automation",
        description:
          "Surface approvals, payments, and delivery updates in the workspace.",
        status: "blocked",
        priority: "medium",
        dueDate: "2026-07-29",
        position: 2,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
      {
        id: ids.tasks.handoff,
        workspaceId,
        projectId: ids.projects.brand,
        milestoneId: ids.milestones.brandHandoff,
        title: "Prepare component handoff",
        description:
          "Document the core components and usage rules for the client team.",
        status: "todo",
        priority: "medium",
        dueDate: "2026-08-21",
        position: 1,
        isVisibleToClient: true,
        createdBy: ownerId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(projectUpdates)
    .values([
      {
        id: ids.updates.launch,
        workspaceId,
        projectId: ids.projects.launch,
        title: "Launch pages are ready for review",
        body: "The final page set is ready. We have tightened the story, clarified the core outcomes, and prepared the release checklist for sign-off.",
        updateType: "progress",
        isVisibleToClient: true,
        createdBy: ownerId,
        createdAt: new Date("2026-07-14T10:00:00.000Z"),
      },
      {
        id: ids.updates.operations,
        workspaceId,
        projectId: ids.projects.operations,
        title: "Reporting foundation is in place",
        body: "The main dashboard views are connected. Next we are finishing the reporting integration and the activity automation rules.",
        updateType: "milestone",
        isVisibleToClient: true,
        createdBy: ownerId,
        createdAt: new Date("2026-07-12T09:30:00.000Z"),
      },
      {
        id: ids.updates.brand,
        workspaceId,
        projectId: ids.projects.brand,
        title: "Brand system work has started",
        body: "We have completed the initial component inventory and are moving into the reusable pattern and handoff phase.",
        updateType: "general",
        isVisibleToClient: true,
        createdBy: ownerId,
        createdAt: new Date("2026-07-09T14:15:00.000Z"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(approvals)
    .values([
      {
        id: ids.approvals.launch,
        workspaceId,
        projectId: ids.projects.launch,
        milestoneId: ids.milestones.launchReview,
        title: "Final launch design approval",
        description:
          "Approve the final launch page direction so implementation and release preparation can continue.",
        status: "pending",
        requestedBy: ownerId,
        requestedAt: new Date("2026-07-14T10:00:00.000Z"),
        createdAt: new Date("2026-07-14T10:00:00.000Z"),
      },
      {
        id: ids.approvals.operations,
        workspaceId,
        projectId: ids.projects.operations,
        milestoneId: ids.milestones.operationsFoundation,
        title: "Operations hub foundation",
        description:
          "Confirm the dashboard structure and project reporting direction.",
        status: "approved",
        requestedBy: ownerId,
        respondedBy: ownerId,
        responseNote: "Approved for the reporting integration phase.",
        requestedAt: new Date("2026-07-08T10:00:00.000Z"),
        respondedAt: new Date("2026-07-09T11:30:00.000Z"),
        createdAt: new Date("2026-07-08T10:00:00.000Z"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(payments)
    .values([
      {
        id: ids.payments.launchDeposit,
        workspaceId,
        projectId: ids.projects.launch,
        amountCents: 240000,
        currency: "EUR",
        status: "paid",
        dueDate: "2026-07-03",
        paidAt: new Date("2026-07-02T14:00:00.000Z"),
        notes: "Launch platform project deposit.",
        createdAt: new Date("2026-06-20T09:00:00.000Z"),
      },
      {
        id: ids.payments.launchFinal,
        workspaceId,
        projectId: ids.projects.launch,
        amountCents: 180000,
        currency: "EUR",
        status: "unpaid",
        dueDate: "2026-07-24",
        notes: "Final payment due before release.",
        createdAt: new Date("2026-07-08T09:00:00.000Z"),
      },
      {
        id: ids.payments.operationsDeposit,
        workspaceId,
        projectId: ids.projects.operations,
        amountCents: 320000,
        currency: "EUR",
        status: "partial",
        dueDate: "2026-07-08",
        notes: "Operations hub build with the balance remaining after deposit.",
        createdAt: new Date("2026-06-27T09:00:00.000Z"),
      },
      {
        id: ids.payments.operationsMilestone,
        workspaceId,
        projectId: ids.projects.operations,
        amountCents: 95000,
        currency: "EUR",
        status: "overdue",
        dueDate: "2026-07-10",
        notes: "Reporting integration milestone.",
        createdAt: new Date("2026-07-01T09:00:00.000Z"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(feedback)
    .values([
      {
        id: ids.feedback.launch,
        workspaceId,
        projectId: ids.projects.launch,
        clientId: ids.clients.northstar,
        message:
          "The final direction looks strong. Please make the customer proof section slightly more prominent before release.",
        status: "open",
        isVisibleToClient: true,
        createdAt: new Date("2026-07-14T11:20:00.000Z"),
      },
      {
        id: ids.feedback.operations,
        workspaceId,
        projectId: ids.projects.operations,
        clientId: ids.clients.atelier,
        message:
          "The dashboard is much easier to scan now. The financial summary answers the question we needed to solve.",
        status: "resolved",
        adminResponse:
          "Great to hear. We will keep the summary format as we complete reporting integration.",
        isVisibleToClient: true,
        resolvedAt: new Date("2026-07-11T15:00:00.000Z"),
        createdAt: new Date("2026-07-10T14:15:00.000Z"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(projectActivity)
    .values([
      {
        id: ids.activity.launch,
        workspaceId,
        projectId: ids.projects.launch,
        actorId: ownerId,
        actorName: "Skerdi",
        actorRole: "owner",
        type: "project_update_added",
        message: "Posted the launch review update.",
        metadata: { source: "screenshot-seed", updateId: ids.updates.launch },
        createdAt: new Date("2026-07-14T10:00:00.000Z"),
      },
      {
        id: ids.activity.approval,
        workspaceId,
        projectId: ids.projects.launch,
        actorId: ownerId,
        actorName: "Skerdi",
        actorRole: "owner",
        type: "approval_requested",
        message: "Requested approval for the final launch design.",
        metadata: {
          source: "screenshot-seed",
          approvalId: ids.approvals.launch,
        },
        createdAt: new Date("2026-07-14T10:05:00.000Z"),
      },
      {
        id: ids.activity.operations,
        workspaceId,
        projectId: ids.projects.operations,
        actorId: ownerId,
        actorName: "Skerdi",
        actorRole: "owner",
        type: "project_update_added",
        message: "Posted the reporting integration update.",
        metadata: {
          source: "screenshot-seed",
          updateId: ids.updates.operations,
        },
        createdAt: new Date("2026-07-12T09:30:00.000Z"),
      },
      {
        id: ids.activity.payment,
        workspaceId,
        projectId: ids.projects.operations,
        actorId: ownerId,
        actorName: "Skerdi",
        actorRole: "owner",
        type: "payment_created",
        message: "Added the reporting integration milestone payment.",
        metadata: {
          source: "screenshot-seed",
          paymentId: ids.payments.operationsMilestone,
        },
        createdAt: new Date("2026-07-01T09:00:00.000Z"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(adminNotes)
    .values([
      {
        id: ids.notes.launch,
        workspaceId,
        content:
          "Launch review: follow up on the final approval before the July 24 release target.",
        createdBy: ownerId,
      },
      {
        id: ids.notes.operations,
        workspaceId,
        content:
          "Operations Hub: confirm reporting integration scope with Atelier & Co. this week.",
        createdBy: ownerId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(notifications)
    .values([
      {
        id: ids.notifications.approval,
        workspaceId,
        recipientProfileId: ownerId,
        actorProfileId: ownerId,
        projectId: ids.projects.launch,
        type: "approval_requested",
        title: "Approval ready for review",
        message: "Final launch design approval is awaiting a response.",
        entityType: "approval",
        entityId: ids.approvals.launch,
        actionUrl: `/admin/approvals/${ids.approvals.launch}`,
        dedupeKey: "screenshot-seed-launch-approval",
      },
      {
        id: ids.notifications.payment,
        workspaceId,
        recipientProfileId: ownerId,
        actorProfileId: ownerId,
        projectId: ids.projects.operations,
        type: "payment_overdue",
        title: "Payment needs attention",
        message: "The Operations Hub reporting milestone payment is overdue.",
        entityType: "payment",
        entityId: ids.payments.operationsMilestone,
        actionUrl: "/admin/payments",
        dedupeKey: "screenshot-seed-operations-payment",
      },
    ])
    .onConflictDoNothing();

  const [
    [clientCount],
    [projectCount],
    [taskCount],
    [approvalCount],
    [paymentCount],
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(clients)
      .where(inArray(clients.id, Object.values(ids.clients))),
    db
      .select({ count: count() })
      .from(projects)
      .where(inArray(projects.id, Object.values(ids.projects))),
    db
      .select({ count: count() })
      .from(tasks)
      .where(inArray(tasks.id, Object.values(ids.tasks))),
    db
      .select({ count: count() })
      .from(approvals)
      .where(inArray(approvals.id, Object.values(ids.approvals))),
    db
      .select({ count: count() })
      .from(payments)
      .where(inArray(payments.id, Object.values(ids.payments))),
  ]);

  console.log(
    `Screenshot seed completed for ${email} in ${account.workspaceName}.`,
  );
  console.log(
    `Verified ${clientCount.count} clients, ${projectCount.count} projects, ${taskCount.count} tasks, ${approvalCount.count} approvals, and ${paymentCount.count} payments.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
