import { config } from "dotenv";

config({ path: ".env.local" });

import { inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  approvals,
  authUsers,
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
} from "@/db/schema";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL");
}

const client = postgres(connectionString, {
  prepare: false,
});

const db = drizzle(client);

const demoEmails = {
  admin: "admin@deliverflow.demo",
  client: "client@deliverflow.demo",
  northwind: "northwind@deliverflow.demo",
} as const;

const ids = {
  clients: {
    acmeStudio: "11111111-1111-4111-8111-111111111111",
    northwindDigital: "22222222-2222-4222-8222-222222222222",
  },
  projects: {
    websiteRedesign: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    saasDashboardMvp: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    aiSupportWorkflow: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  },
  milestones: {
    discovery: "10000000-0000-4000-8000-000000000001",
    designReview: "10000000-0000-4000-8000-000000000002",
    dashboardFoundation: "10000000-0000-4000-8000-000000000003",
    dataIntegration: "10000000-0000-4000-8000-000000000004",
    workflowPilot: "10000000-0000-4000-8000-000000000005",
    launchPrep: "10000000-0000-4000-8000-000000000006",
  },
  tasks: {
    sitemap: "20000000-0000-4000-8000-000000000001",
    homepageConcept: "20000000-0000-4000-8000-000000000002",
    responsiveQa: "20000000-0000-4000-8000-000000000003",
    dashboardShell: "20000000-0000-4000-8000-000000000004",
    billingCards: "20000000-0000-4000-8000-000000000005",
    supabaseReports: "20000000-0000-4000-8000-000000000006",
    knowledgeMap: "20000000-0000-4000-8000-000000000007",
    escalationRules: "20000000-0000-4000-8000-000000000008",
  },
  updates: {
    designDirection: "30000000-0000-4000-8000-000000000001",
    prototypeReady: "30000000-0000-4000-8000-000000000002",
    dashboardProgress: "30000000-0000-4000-8000-000000000003",
    workflowPilot: "30000000-0000-4000-8000-000000000004",
  },
  payments: {
    websiteDeposit: "40000000-0000-4000-8000-000000000001",
    websiteFinal: "40000000-0000-4000-8000-000000000002",
    dashboardDeposit: "40000000-0000-4000-8000-000000000003",
    dashboardMilestone: "40000000-0000-4000-8000-000000000004",
    workflowInvoice: "40000000-0000-4000-8000-000000000005",
  },
  feedback: {
    acmeHero: "50000000-0000-4000-8000-000000000001",
    acmeProof: "50000000-0000-4000-8000-000000000002",
    northwindMetrics: "50000000-0000-4000-8000-000000000003",
    northwindWorkflow: "50000000-0000-4000-8000-000000000004",
  },
  approvals: {
    acmeDesign: "60000000-0000-4000-8000-000000000001",
    dashboardPrototype: "60000000-0000-4000-8000-000000000002",
    workflowPilot: "60000000-0000-4000-8000-000000000003",
  },
  files: {
    websiteBrief: "70000000-0000-4000-8000-000000000001",
    homepagePreview: "70000000-0000-4000-8000-000000000002",
    dashboardPrototype: "70000000-0000-4000-8000-000000000003",
    workflowMap: "70000000-0000-4000-8000-000000000004",
    invoice: "70000000-0000-4000-8000-000000000005",
  },
  activity: {
    websiteCreated: "80000000-0000-4000-8000-000000000001",
    websiteFile: "80000000-0000-4000-8000-000000000002",
    dashboardApproval: "80000000-0000-4000-8000-000000000003",
    dashboardPayment: "80000000-0000-4000-8000-000000000004",
    workflowUpdate: "80000000-0000-4000-8000-000000000005",
  },
  views: {
    acmeProject: "90000000-0000-4000-8000-000000000001",
    acmeApproval: "90000000-0000-4000-8000-000000000002",
    northwindProject: "90000000-0000-4000-8000-000000000003",
  },
} as const;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getRequiredUserId(
  envName: "DEMO_ADMIN_USER_ID" | "DEMO_CLIENT_USER_ID",
) {
  const value = process.env[envName]?.trim();

  if (!value) {
    throw new Error(
      [
        `Missing ${envName}.`,
        "Create the demo user in Supabase Auth first, then add the user's UUID to your environment.",
        `Expected demo auth emails: ${demoEmails.admin} and ${demoEmails.client}.`,
      ].join("\n"),
    );
  }

  if (!uuidPattern.test(value)) {
    throw new Error(`${envName} must be a Supabase Auth user UUID.`);
  }

  return value;
}

async function assertAuthUsersExist(adminId: string, clientId: string) {
  const authRows = await db
    .select({
      id: authUsers.id,
      email: authUsers.email,
    })
    .from(authUsers)
    .where(inArray(authUsers.id, [adminId, clientId]));

  const authUserIds = new Set(authRows.map((row) => row.id));
  const missingUserIds = [adminId, clientId].filter(
    (id) => !authUserIds.has(id),
  );

  if (missingUserIds.length > 0) {
    throw new Error(
      [
        "The demo Supabase Auth users were not found.",
        "Create these users in Supabase Authentication, then set:",
        `DEMO_ADMIN_USER_ID=<UUID for ${demoEmails.admin}>`,
        `DEMO_CLIENT_USER_ID=<UUID for ${demoEmails.client}>`,
        `Missing UUIDs: ${missingUserIds.join(", ")}`,
      ].join("\n"),
    );
  }

  const emailById = new Map(
    authRows.map((row) => [row.id, row.email?.toLowerCase()]),
  );
  const expectedEmailById = new Map([
    [adminId, demoEmails.admin],
    [clientId, demoEmails.client],
  ]);
  const mismatchedEmails = Array.from(expectedEmailById.entries()).filter(
    ([id, email]) => emailById.get(id) !== email,
  );

  if (mismatchedEmails.length > 0) {
    throw new Error(
      [
        "The demo UUIDs must belong to the requested Supabase Auth emails.",
        ...mismatchedEmails.map(([id, expectedEmail]) => {
          const actualEmail = emailById.get(id) ?? "unknown";
          return `${id}: expected ${expectedEmail}, found ${actualEmail}`;
        }),
      ].join("\n"),
    );
  }
}

async function main() {
  console.log("Starting DeliverFlow demo seed...");

  const adminId = getRequiredUserId("DEMO_ADMIN_USER_ID");
  const clientId = getRequiredUserId("DEMO_CLIENT_USER_ID");

  if (adminId === clientId) {
    throw new Error(
      "DEMO_ADMIN_USER_ID and DEMO_CLIENT_USER_ID must be different users.",
    );
  }

  await assertAuthUsersExist(adminId, clientId);

  await db
    .insert(profiles)
    .values([
      {
        id: adminId,
        email: demoEmails.admin,
        fullName: "Jordan Ellis",
        role: "admin",
      },
      {
        id: clientId,
        email: demoEmails.client,
        fullName: "Maya Chen",
        role: "client",
      },
    ])
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        email: sql`excluded.email`,
        fullName: sql`excluded.full_name`,
        role: sql`excluded.role`,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(clients)
    .values([
      {
        id: ids.clients.acmeStudio,
        profileId: clientId,
        companyName: "Acme Studio",
        contactName: "Maya Chen",
        email: demoEmails.client,
        phone: "+1 555 019 1042",
        status: "active",
        notes:
          "Brand studio testing a polished client portal for active website work.",
        createdBy: adminId,
        archivedAt: null,
        deletedAt: null,
      },
      {
        id: ids.clients.northwindDigital,
        profileId: null,
        companyName: "Northwind Digital",
        contactName: "Elliot Harper",
        email: demoEmails.northwind,
        phone: "+1 555 019 2088",
        status: "active",
        notes:
          "Operations team reviewing a dashboard MVP and support automation pilot.",
        createdBy: adminId,
        archivedAt: null,
        deletedAt: null,
      },
    ])
    .onConflictDoUpdate({
      target: clients.id,
      set: {
        profileId: sql`excluded.profile_id`,
        companyName: sql`excluded.company_name`,
        contactName: sql`excluded.contact_name`,
        email: sql`excluded.email`,
        phone: sql`excluded.phone`,
        status: sql`excluded.status`,
        notes: sql`excluded.notes`,
        createdBy: sql`excluded.created_by`,
        archivedAt: null,
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(projects)
    .values([
      {
        id: ids.projects.websiteRedesign,
        name: "Website Redesign",
        slug: "demo-website-redesign",
        description:
          "A complete website refresh with clearer positioning, responsive page templates, and launch-ready content.",
        status: "waiting_feedback",
        progress: 82,
        liveDemoUrl: "https://demo.deliverflow.dev/website-redesign",
        repositoryUrl: "https://github.com/deliverflow-demo/website-redesign",
        deadline: "2026-07-18",
        createdBy: adminId,
        archivedAt: null,
        deletedAt: null,
      },
      {
        id: ids.projects.saasDashboardMvp,
        name: "SaaS Dashboard MVP",
        slug: "demo-saas-dashboard-mvp",
        description:
          "A product dashboard MVP with role-based reporting, billing visibility, and a focused admin workflow.",
        status: "in_progress",
        progress: 58,
        liveDemoUrl: "https://demo.deliverflow.dev/saas-dashboard-mvp",
        repositoryUrl: "https://github.com/deliverflow-demo/saas-dashboard-mvp",
        deadline: "2026-08-06",
        createdBy: adminId,
        archivedAt: null,
        deletedAt: null,
      },
      {
        id: ids.projects.aiSupportWorkflow,
        name: "AI Support Workflow",
        slug: "demo-ai-support-workflow",
        description:
          "A support workflow pilot that triages requests, drafts replies, and routes edge cases to the right team.",
        status: "active",
        progress: 34,
        liveDemoUrl: "https://demo.deliverflow.dev/ai-support-workflow",
        repositoryUrl:
          "https://github.com/deliverflow-demo/ai-support-workflow",
        deadline: "2026-09-02",
        createdBy: adminId,
        archivedAt: null,
        deletedAt: null,
      },
    ])
    .onConflictDoUpdate({
      target: projects.id,
      set: {
        name: sql`excluded.name`,
        slug: sql`excluded.slug`,
        description: sql`excluded.description`,
        status: sql`excluded.status`,
        progress: sql`excluded.progress`,
        liveDemoUrl: sql`excluded.live_demo_url`,
        repositoryUrl: sql`excluded.repository_url`,
        deadline: sql`excluded.deadline`,
        createdBy: sql`excluded.created_by`,
        archivedAt: null,
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(projectAssignments)
    .values([
      {
        projectId: ids.projects.websiteRedesign,
        clientId: ids.clients.acmeStudio,
        assignedBy: adminId,
      },
      {
        projectId: ids.projects.saasDashboardMvp,
        clientId: ids.clients.acmeStudio,
        assignedBy: adminId,
      },
      {
        projectId: ids.projects.aiSupportWorkflow,
        clientId: ids.clients.northwindDigital,
        assignedBy: adminId,
      },
    ])
    .onConflictDoUpdate({
      target: [projectAssignments.projectId, projectAssignments.clientId],
      set: {
        assignedBy: sql`excluded.assigned_by`,
        assignedAt: sql`excluded.assigned_at`,
      },
    });

  await db
    .insert(milestones)
    .values([
      {
        id: ids.milestones.discovery,
        projectId: ids.projects.websiteRedesign,
        title: "Discovery and content plan",
        description:
          "Sitemap, page priorities, and messaging direction approved for the redesign.",
        status: "completed",
        dueDate: "2026-06-26",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: ids.milestones.designReview,
        projectId: ids.projects.websiteRedesign,
        title: "Homepage design review",
        description:
          "High-fidelity homepage and service page layouts are ready for client review.",
        status: "waiting_approval",
        dueDate: "2026-07-09",
        position: 2,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: ids.milestones.dashboardFoundation,
        projectId: ids.projects.saasDashboardMvp,
        title: "Dashboard foundation",
        description:
          "Navigation, metrics, project cards, and billing overview are in place.",
        status: "completed",
        dueDate: "2026-07-03",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: ids.milestones.dataIntegration,
        projectId: ids.projects.saasDashboardMvp,
        title: "Data integration",
        description:
          "Connect Supabase data, reporting filters, and customer-facing summaries.",
        status: "in_progress",
        dueDate: "2026-07-24",
        position: 2,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: ids.milestones.workflowPilot,
        projectId: ids.projects.aiSupportWorkflow,
        title: "Workflow pilot",
        description:
          "Map support intake, triage rules, escalation paths, and reporting events.",
        status: "in_progress",
        dueDate: "2026-08-14",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: ids.milestones.launchPrep,
        projectId: ids.projects.aiSupportWorkflow,
        title: "Launch preparation",
        description:
          "Prepare handoff notes, prompt library, and team training checklist.",
        status: "not_started",
        dueDate: "2026-08-28",
        position: 2,
        isVisibleToClient: true,
        createdBy: adminId,
      },
    ])
    .onConflictDoUpdate({
      target: milestones.id,
      set: {
        projectId: sql`excluded.project_id`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        status: sql`excluded.status`,
        dueDate: sql`excluded.due_date`,
        position: sql`excluded.position`,
        isVisibleToClient: sql`excluded.is_visible_to_client`,
        createdBy: sql`excluded.created_by`,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(tasks)
    .values([
      {
        id: ids.tasks.sitemap,
        projectId: ids.projects.websiteRedesign,
        milestoneId: ids.milestones.discovery,
        title: "Finalize sitemap",
        description:
          "Confirm top-level navigation, service pages, and launch scope.",
        status: "completed",
        priority: "high",
        dueDate: "2026-06-25",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
        deletedAt: null,
      },
      {
        id: ids.tasks.homepageConcept,
        projectId: ids.projects.websiteRedesign,
        milestoneId: ids.milestones.designReview,
        title: "Prepare homepage concept",
        description:
          "Package homepage, services, and case-study section for review.",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-07-08",
        position: 2,
        isVisibleToClient: true,
        createdBy: adminId,
        deletedAt: null,
      },
      {
        id: ids.tasks.responsiveQa,
        projectId: ids.projects.websiteRedesign,
        milestoneId: ids.milestones.designReview,
        title: "Run responsive QA pass",
        description:
          "Check mobile and tablet states after the final design notes are approved.",
        status: "todo",
        priority: "medium",
        dueDate: "2026-07-15",
        position: 3,
        isVisibleToClient: true,
        createdBy: adminId,
        deletedAt: null,
      },
      {
        id: ids.tasks.dashboardShell,
        projectId: ids.projects.saasDashboardMvp,
        milestoneId: ids.milestones.dashboardFoundation,
        title: "Build dashboard shell",
        description:
          "Create the core admin dashboard layout and project summary cards.",
        status: "completed",
        priority: "high",
        dueDate: "2026-07-02",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
        deletedAt: null,
      },
      {
        id: ids.tasks.billingCards,
        projectId: ids.projects.saasDashboardMvp,
        milestoneId: ids.milestones.dataIntegration,
        title: "Connect billing cards",
        description:
          "Show paid, partial, overdue, and upcoming payment states in the portal.",
        status: "in_progress",
        priority: "medium",
        dueDate: "2026-07-20",
        position: 2,
        isVisibleToClient: true,
        createdBy: adminId,
        deletedAt: null,
      },
      {
        id: ids.tasks.supabaseReports,
        projectId: ids.projects.saasDashboardMvp,
        milestoneId: ids.milestones.dataIntegration,
        title: "Wire Supabase reports",
        description:
          "Load chart data, project counts, and recent account activity from the database.",
        status: "blocked",
        priority: "high",
        dueDate: "2026-07-23",
        position: 3,
        isVisibleToClient: true,
        createdBy: adminId,
        deletedAt: null,
      },
      {
        id: ids.tasks.knowledgeMap,
        projectId: ids.projects.aiSupportWorkflow,
        milestoneId: ids.milestones.workflowPilot,
        title: "Map support knowledge sources",
        description:
          "Inventory help center content, macros, and escalation categories.",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-08-05",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
        deletedAt: null,
      },
      {
        id: ids.tasks.escalationRules,
        projectId: ids.projects.aiSupportWorkflow,
        milestoneId: ids.milestones.launchPrep,
        title: "Draft escalation rules",
        description:
          "Define when AI drafts are routed to finance, product, or account owners.",
        status: "todo",
        priority: "medium",
        dueDate: "2026-08-22",
        position: 2,
        isVisibleToClient: true,
        createdBy: adminId,
        deletedAt: null,
      },
    ])
    .onConflictDoUpdate({
      target: tasks.id,
      set: {
        projectId: sql`excluded.project_id`,
        milestoneId: sql`excluded.milestone_id`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        status: sql`excluded.status`,
        priority: sql`excluded.priority`,
        dueDate: sql`excluded.due_date`,
        position: sql`excluded.position`,
        isVisibleToClient: sql`excluded.is_visible_to_client`,
        createdBy: sql`excluded.created_by`,
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(projectUpdates)
    .values([
      {
        id: ids.updates.designDirection,
        projectId: ids.projects.websiteRedesign,
        title: "Design direction is ready",
        body: "The updated visual direction uses stronger service positioning, clearer proof points, and a tighter mobile layout.",
        updateType: "progress",
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: ids.updates.prototypeReady,
        projectId: ids.projects.websiteRedesign,
        title: "Prototype shared for review",
        body: "The clickable homepage prototype is available. Please review the hero, services, and proof sections first.",
        updateType: "approval",
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: ids.updates.dashboardProgress,
        projectId: ids.projects.saasDashboardMvp,
        title: "Dashboard MVP progress",
        body: "The project overview, payment summaries, and recent activity panels are now connected to demo data.",
        updateType: "progress",
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: ids.updates.workflowPilot,
        projectId: ids.projects.aiSupportWorkflow,
        title: "Support workflow pilot started",
        body: "We mapped the first intake paths and started drafting triage rules for common support requests.",
        updateType: "general",
        isVisibleToClient: true,
        createdBy: adminId,
      },
    ])
    .onConflictDoUpdate({
      target: projectUpdates.id,
      set: {
        projectId: sql`excluded.project_id`,
        title: sql`excluded.title`,
        body: sql`excluded.body`,
        updateType: sql`excluded.update_type`,
        isVisibleToClient: sql`excluded.is_visible_to_client`,
        createdBy: sql`excluded.created_by`,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(feedback)
    .values([
      {
        id: ids.feedback.acmeHero,
        projectId: ids.projects.websiteRedesign,
        clientId: ids.clients.acmeStudio,
        createdBy: clientId,
        message:
          "The new homepage is much clearer. Can we make the proof section feel a bit more specific to agency clients?",
        status: "open",
        adminResponse: null,
        isVisibleToClient: true,
        archivedAt: null,
        resolvedAt: null,
        deletedAt: null,
      },
      {
        id: ids.feedback.acmeProof,
        projectId: ids.projects.websiteRedesign,
        clientId: ids.clients.acmeStudio,
        createdBy: clientId,
        message:
          "The case-study block works well. The testimonial copy can stay as-is.",
        status: "resolved",
        adminResponse:
          "Great, I kept the testimonial block and marked the section ready for launch.",
        isVisibleToClient: true,
        resolvedAt: new Date("2026-06-28T14:00:00.000Z"),
        archivedAt: null,
        deletedAt: null,
      },
      {
        id: ids.feedback.northwindMetrics,
        projectId: ids.projects.saasDashboardMvp,
        clientId: ids.clients.acmeStudio,
        createdBy: clientId,
        message:
          "The metrics layout is easy to scan. Please keep the overdue payment count visible on mobile.",
        status: "reviewed",
        adminResponse:
          "Noted. I will keep the billing summary above the fold on smaller screens.",
        isVisibleToClient: true,
        archivedAt: null,
        resolvedAt: null,
        deletedAt: null,
      },
      {
        id: ids.feedback.northwindWorkflow,
        projectId: ids.projects.aiSupportWorkflow,
        clientId: ids.clients.northwindDigital,
        createdBy: null,
        message:
          "The escalation map should include refund requests and enterprise account handoffs.",
        status: "open",
        adminResponse: null,
        isVisibleToClient: true,
        archivedAt: null,
        resolvedAt: null,
        deletedAt: null,
      },
    ])
    .onConflictDoUpdate({
      target: feedback.id,
      set: {
        projectId: sql`excluded.project_id`,
        clientId: sql`excluded.client_id`,
        createdBy: sql`excluded.created_by`,
        message: sql`excluded.message`,
        status: sql`excluded.status`,
        adminResponse: sql`excluded.admin_response`,
        isVisibleToClient: sql`excluded.is_visible_to_client`,
        archivedAt: sql`excluded.archived_at`,
        resolvedAt: sql`excluded.resolved_at`,
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(approvals)
    .values([
      {
        id: ids.approvals.acmeDesign,
        projectId: ids.projects.websiteRedesign,
        milestoneId: ids.milestones.designReview,
        title: "Homepage design approval",
        description:
          "Review the homepage and service page design direction before development begins.",
        status: "pending",
        requestedBy: adminId,
        respondedBy: null,
        responseNote: null,
        cancelReason: null,
        requestedAt: new Date("2026-06-29T10:00:00.000Z"),
        respondedAt: null,
        cancelledAt: null,
        deletedAt: null,
      },
      {
        id: ids.approvals.dashboardPrototype,
        projectId: ids.projects.saasDashboardMvp,
        milestoneId: ids.milestones.dashboardFoundation,
        title: "Dashboard prototype approval",
        description:
          "Approve the MVP dashboard layout so we can finish the reporting integration.",
        status: "approved",
        requestedBy: adminId,
        respondedBy: clientId,
        responseNote:
          "Approved. The dashboard gives us the right level of operational detail.",
        cancelReason: null,
        requestedAt: new Date("2026-06-27T09:30:00.000Z"),
        respondedAt: new Date("2026-06-28T12:15:00.000Z"),
        cancelledAt: null,
        deletedAt: null,
      },
      {
        id: ids.approvals.workflowPilot,
        projectId: ids.projects.aiSupportWorkflow,
        milestoneId: ids.milestones.workflowPilot,
        title: "Support workflow pilot review",
        description:
          "Confirm the first workflow map before we build the automation rules.",
        status: "changes_requested",
        requestedBy: adminId,
        respondedBy: null,
        responseNote:
          "Please include refund and enterprise-account paths before the next review.",
        cancelReason: null,
        requestedAt: new Date("2026-06-26T11:00:00.000Z"),
        respondedAt: new Date("2026-06-29T08:45:00.000Z"),
        cancelledAt: null,
        deletedAt: null,
      },
    ])
    .onConflictDoUpdate({
      target: approvals.id,
      set: {
        projectId: sql`excluded.project_id`,
        milestoneId: sql`excluded.milestone_id`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        status: sql`excluded.status`,
        requestedBy: sql`excluded.requested_by`,
        respondedBy: sql`excluded.responded_by`,
        responseNote: sql`excluded.response_note`,
        cancelReason: sql`excluded.cancel_reason`,
        requestedAt: sql`excluded.requested_at`,
        respondedAt: sql`excluded.responded_at`,
        cancelledAt: sql`excluded.cancelled_at`,
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(payments)
    .values([
      {
        id: ids.payments.websiteDeposit,
        projectId: ids.projects.websiteRedesign,
        amountCents: 180000,
        currency: "USD",
        status: "paid",
        dueDate: "2026-06-24",
        paidAt: new Date("2026-06-24T16:00:00.000Z"),
        voidedAt: null,
        voidReason: null,
        deletedAt: null,
        notes: "Website redesign deposit.",
      },
      {
        id: ids.payments.websiteFinal,
        projectId: ids.projects.websiteRedesign,
        amountCents: 140000,
        currency: "USD",
        status: "unpaid",
        dueDate: "2026-07-18",
        paidAt: null,
        voidedAt: null,
        voidReason: null,
        deletedAt: null,
        notes: "Final website redesign payment due before launch.",
      },
      {
        id: ids.payments.dashboardDeposit,
        projectId: ids.projects.saasDashboardMvp,
        amountCents: 250000,
        currency: "USD",
        status: "partial",
        dueDate: "2026-07-08",
        paidAt: null,
        voidedAt: null,
        voidReason: null,
        deletedAt: null,
        notes: "Dashboard MVP build, deposit received with balance remaining.",
      },
      {
        id: ids.payments.dashboardMilestone,
        projectId: ids.projects.saasDashboardMvp,
        amountCents: 95000,
        currency: "USD",
        status: "overdue",
        dueDate: "2026-06-28",
        paidAt: null,
        voidedAt: null,
        voidReason: null,
        deletedAt: null,
        notes: "Reporting integration milestone.",
      },
      {
        id: ids.payments.workflowInvoice,
        projectId: ids.projects.aiSupportWorkflow,
        amountCents: 210000,
        currency: "USD",
        status: "unpaid",
        dueDate: "2026-08-14",
        paidAt: null,
        voidedAt: null,
        voidReason: null,
        deletedAt: null,
        notes: "AI support workflow pilot invoice.",
      },
    ])
    .onConflictDoUpdate({
      target: payments.id,
      set: {
        projectId: sql`excluded.project_id`,
        amountCents: sql`excluded.amount_cents`,
        currency: sql`excluded.currency`,
        status: sql`excluded.status`,
        dueDate: sql`excluded.due_date`,
        paidAt: sql`excluded.paid_at`,
        voidedAt: sql`excluded.voided_at`,
        voidReason: sql`excluded.void_reason`,
        deletedAt: null,
        notes: sql`excluded.notes`,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(projectFiles)
    .values([
      {
        id: ids.files.websiteBrief,
        projectId: ids.projects.websiteRedesign,
        uploadedBy: adminId,
        fileName: "Website Redesign Brief.pdf",
        bucketName: "project-files",
        storagePath: "demo/website-redesign/website-redesign-brief.pdf",
        fileType: "application/pdf",
        fileSize: 1_860_000,
        category: "brief",
        isVisibleToClient: true,
        deletedAt: null,
      },
      {
        id: ids.files.homepagePreview,
        projectId: ids.projects.websiteRedesign,
        uploadedBy: adminId,
        fileName: "Homepage Design Preview.png",
        bucketName: "project-files",
        storagePath: "demo/website-redesign/homepage-design-preview.png",
        fileType: "image/png",
        fileSize: 3_420_000,
        category: "design",
        isVisibleToClient: true,
        deletedAt: null,
      },
      {
        id: ids.files.dashboardPrototype,
        projectId: ids.projects.saasDashboardMvp,
        uploadedBy: adminId,
        fileName: "Dashboard Prototype.pdf",
        bucketName: "project-files",
        storagePath: "demo/saas-dashboard-mvp/dashboard-prototype.pdf",
        fileType: "application/pdf",
        fileSize: 2_480_000,
        category: "deliverable",
        isVisibleToClient: true,
        deletedAt: null,
      },
      {
        id: ids.files.workflowMap,
        projectId: ids.projects.aiSupportWorkflow,
        uploadedBy: adminId,
        fileName: "Support Workflow Map.pdf",
        bucketName: "project-files",
        storagePath: "demo/ai-support-workflow/support-workflow-map.pdf",
        fileType: "application/pdf",
        fileSize: 1_240_000,
        category: "document",
        isVisibleToClient: true,
        deletedAt: null,
      },
      {
        id: ids.files.invoice,
        projectId: ids.projects.websiteRedesign,
        uploadedBy: adminId,
        fileName: "Website Redesign Invoice.pdf",
        bucketName: "project-files",
        storagePath: "demo/website-redesign/website-redesign-invoice.pdf",
        fileType: "application/pdf",
        fileSize: 480_000,
        category: "invoice",
        isVisibleToClient: true,
        deletedAt: null,
      },
    ])
    .onConflictDoUpdate({
      target: projectFiles.id,
      set: {
        projectId: sql`excluded.project_id`,
        uploadedBy: sql`excluded.uploaded_by`,
        fileName: sql`excluded.file_name`,
        bucketName: sql`excluded.bucket_name`,
        storagePath: sql`excluded.storage_path`,
        fileType: sql`excluded.file_type`,
        fileSize: sql`excluded.file_size`,
        category: sql`excluded.category`,
        isVisibleToClient: sql`excluded.is_visible_to_client`,
        deletedAt: null,
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(projectActivity)
    .values([
      {
        id: ids.activity.websiteCreated,
        projectId: ids.projects.websiteRedesign,
        actorId: adminId,
        actorName: "Jordan Ellis",
        actorRole: "admin",
        type: "project_created",
        message: "Created the Website Redesign project workspace.",
        metadata: { source: "demo-seed" },
        createdAt: new Date("2026-06-24T09:00:00.000Z"),
      },
      {
        id: ids.activity.websiteFile,
        projectId: ids.projects.websiteRedesign,
        actorId: adminId,
        actorName: "Jordan Ellis",
        actorRole: "admin",
        type: "file_uploaded",
        message: "Uploaded the homepage design preview.",
        metadata: { source: "demo-seed", fileId: ids.files.homepagePreview },
        createdAt: new Date("2026-06-28T15:20:00.000Z"),
      },
      {
        id: ids.activity.dashboardApproval,
        projectId: ids.projects.saasDashboardMvp,
        actorId: adminId,
        actorName: "Jordan Ellis",
        actorRole: "admin",
        type: "approval_requested",
        message: "Requested approval for the dashboard prototype.",
        metadata: {
          source: "demo-seed",
          approvalId: ids.approvals.dashboardPrototype,
        },
        createdAt: new Date("2026-06-27T09:30:00.000Z"),
      },
      {
        id: ids.activity.dashboardPayment,
        projectId: ids.projects.saasDashboardMvp,
        actorId: adminId,
        actorName: "Jordan Ellis",
        actorRole: "admin",
        type: "payment_created",
        message: "Added the reporting integration milestone payment.",
        metadata: {
          source: "demo-seed",
          paymentId: ids.payments.dashboardMilestone,
        },
        createdAt: new Date("2026-06-28T10:15:00.000Z"),
      },
      {
        id: ids.activity.workflowUpdate,
        projectId: ids.projects.aiSupportWorkflow,
        actorId: adminId,
        actorName: "Jordan Ellis",
        actorRole: "admin",
        type: "project_update_added",
        message: "Posted the first AI support workflow pilot update.",
        metadata: { source: "demo-seed", updateId: ids.updates.workflowPilot },
        createdAt: new Date("2026-06-29T13:10:00.000Z"),
      },
    ])
    .onConflictDoUpdate({
      target: projectActivity.id,
      set: {
        projectId: sql`excluded.project_id`,
        actorId: sql`excluded.actor_id`,
        actorName: sql`excluded.actor_name`,
        actorRole: sql`excluded.actor_role`,
        type: sql`excluded.type`,
        message: sql`excluded.message`,
        metadata: sql`excluded.metadata`,
        createdAt: sql`excluded.created_at`,
      },
    });

  await db
    .insert(projectViewEvents)
    .values([
      {
        id: ids.views.acmeProject,
        projectId: ids.projects.websiteRedesign,
        clientId: ids.clients.acmeStudio,
        userId: clientId,
        targetType: "project",
        targetId: ids.projects.websiteRedesign,
        viewedAt: new Date("2026-06-29T16:00:00.000Z"),
      },
      {
        id: ids.views.acmeApproval,
        projectId: ids.projects.websiteRedesign,
        clientId: ids.clients.acmeStudio,
        userId: clientId,
        targetType: "approval",
        targetId: ids.approvals.acmeDesign,
        viewedAt: new Date("2026-06-29T16:05:00.000Z"),
      },
      {
        id: ids.views.northwindProject,
        projectId: ids.projects.aiSupportWorkflow,
        clientId: ids.clients.northwindDigital,
        userId: null,
        targetType: "project",
        targetId: ids.projects.aiSupportWorkflow,
        viewedAt: new Date("2026-06-28T18:30:00.000Z"),
      },
    ])
    .onConflictDoUpdate({
      target: projectViewEvents.id,
      set: {
        projectId: sql`excluded.project_id`,
        clientId: sql`excluded.client_id`,
        userId: sql`excluded.user_id`,
        targetType: sql`excluded.target_type`,
        targetId: sql`excluded.target_id`,
        viewedAt: sql`excluded.viewed_at`,
      },
    });

  console.log("DeliverFlow demo seed completed.");
  console.log(`Admin profile: ${demoEmails.admin}`);
  console.log(`Client profile: ${demoEmails.client}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
