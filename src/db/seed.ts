import "dotenv/config";

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
  projectAssignments,
  projectFiles,
  projects,
  projectUpdates,
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

const seedEmails = [
  "admin@deliverflow.dev",
  "sarah@novaagency.com",
  "michael@retailco.com",
  "james@creativehub.co",
];

const ids = {
  clients: {
    novaAgency: "11111111-1111-4111-8111-111111111111",
    retailCo: "22222222-2222-4222-8222-222222222222",
    creativeHub: "33333333-3333-4333-8333-333333333333",
  },
  projects: {
    saasDashboardMvp: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    clientPortalBuild: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    agencyWebsiteRedesign: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  },
};

async function main() {
  console.log("Starting DeliverFlow seed...");

  const existingUsers = await db
    .select({
      id: authUsers.id,
      email: authUsers.email,
    })
    .from(authUsers)
    .where(inArray(authUsers.email, seedEmails));

  const userByEmail = new Map(
    existingUsers.map((user) => [user.email, user.id]),
  );

  const adminId = userByEmail.get("admin@deliverflow.dev");
  const sarahId = userByEmail.get("sarah@novaagency.com");
  const michaelId = userByEmail.get("michael@retailco.com");
  const jamesId = userByEmail.get("james@creativehub.co");

  if (!adminId || !sarahId || !michaelId || !jamesId) {
    throw new Error(
      [
        "Missing Supabase Auth seed users.",
        "Create these users first in Supabase Authentication:",
        "admin@deliverflow.dev",
        "sarah@novaagency.com",
        "michael@retailco.com",
        "james@creativehub.co",
      ].join("\n"),
    );
  }

  await db
    .insert(profiles)
    .values([
      {
        id: adminId,
        email: "admin@deliverflow.dev",
        fullName: "Alex Johnson",
        role: "admin",
      },
      {
        id: sarahId,
        email: "sarah@novaagency.com",
        fullName: "Sarah Johnson",
        role: "client",
      },
      {
        id: michaelId,
        email: "michael@retailco.com",
        fullName: "Michael Chen",
        role: "client",
      },
      {
        id: jamesId,
        email: "james@creativehub.co",
        fullName: "James Rodriguez",
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
        id: ids.clients.novaAgency,
        profileId: sarahId,
        companyName: "Nova Agency",
        contactName: "Sarah Johnson",
        email: "sarah@novaagency.com",
        phone: "+1 555 100 2001",
        status: "active",
        notes:
          "Marketing agency needing a SaaS-style dashboard for internal reporting.",
        createdBy: adminId,
      },
      {
        id: ids.clients.retailCo,
        profileId: michaelId,
        companyName: "RetailCo",
        contactName: "Michael Chen",
        email: "michael@retailco.com",
        phone: "+1 555 100 2002",
        status: "active",
        notes:
          "E-commerce business improving their client portal and project workflow.",
        createdBy: adminId,
      },
      {
        id: ids.clients.creativeHub,
        profileId: jamesId,
        companyName: "Creative Hub",
        contactName: "James Rodriguez",
        email: "james@creativehub.co",
        phone: "+1 555 100 2003",
        status: "active",
        notes:
          "Creative studio working on a website redesign and approval workflow.",
        createdBy: adminId,
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
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(projects)
    .values([
      {
        id: ids.projects.saasDashboardMvp,
        name: "SaaS Dashboard MVP",
        slug: "saas-dashboard-mvp",
        description:
          "A SaaS-style dashboard MVP with authentication, analytics, project tracking, and admin workflows.",
        status: "in_progress",
        progress: 68,
        liveDemoUrl: "https://demo.deliverflow.dev/saas-dashboard-mvp",
        repositoryUrl: "https://github.com/example/saas-dashboard-mvp",
        deadline: "2026-07-15",
        createdBy: adminId,
      },
      {
        id: ids.projects.clientPortalBuild,
        name: "Client Portal Build",
        slug: "client-portal-build",
        description:
          "A secure client portal where customers can view progress, files, updates, feedback, approvals, and payments.",
        status: "active",
        progress: 45,
        liveDemoUrl: "https://demo.deliverflow.dev/client-portal-build",
        repositoryUrl: "https://github.com/example/client-portal-build",
        deadline: "2026-08-20",
        createdBy: adminId,
      },
      {
        id: ids.projects.agencyWebsiteRedesign,
        name: "Agency Website Redesign",
        slug: "agency-website-redesign",
        description:
          "A modern agency website redesign with responsive pages, improved messaging, and review approval flow.",
        status: "waiting_feedback",
        progress: 90,
        liveDemoUrl: "https://demo.deliverflow.dev/agency-website-redesign",
        repositoryUrl: "https://github.com/example/agency-website-redesign",
        deadline: "2026-06-25",
        createdBy: adminId,
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
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(projectAssignments)
    .values([
      {
        projectId: ids.projects.saasDashboardMvp,
        clientId: ids.clients.novaAgency,
        assignedBy: adminId,
      },
      {
        projectId: ids.projects.clientPortalBuild,
        clientId: ids.clients.retailCo,
        assignedBy: adminId,
      },
      {
        projectId: ids.projects.agencyWebsiteRedesign,
        clientId: ids.clients.creativeHub,
        assignedBy: adminId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(milestones)
    .values([
      {
        id: "10000000-0000-4000-8000-000000000001",
        projectId: ids.projects.saasDashboardMvp,
        title: "Project setup and planning",
        description:
          "Initial project structure, requirements, and delivery plan completed.",
        status: "completed",
        dueDate: "2026-06-01",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "10000000-0000-4000-8000-000000000002",
        projectId: ids.projects.saasDashboardMvp,
        title: "Frontend development milestone",
        description:
          "Main dashboard screens, client portal layout, and responsive components.",
        status: "waiting_approval",
        dueDate: "2026-06-20",
        position: 2,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "10000000-0000-4000-8000-000000000003",
        projectId: ids.projects.saasDashboardMvp,
        title: "Backend API integration",
        description: "Connect dashboard data to Supabase and secure API routes.",
        status: "in_progress",
        dueDate: "2026-07-05",
        position: 3,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "10000000-0000-4000-8000-000000000004",
        projectId: ids.projects.clientPortalBuild,
        title: "Authentication and client access",
        description:
          "Client login, role-based access, and project visibility rules.",
        status: "in_progress",
        dueDate: "2026-07-10",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "10000000-0000-4000-8000-000000000005",
        projectId: ids.projects.agencyWebsiteRedesign,
        title: "Design review",
        description:
          "Final homepage and service page design review before launch.",
        status: "waiting_approval",
        dueDate: "2026-06-18",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(tasks)
    .values([
      {
        id: "20000000-0000-4000-8000-000000000001",
        projectId: ids.projects.saasDashboardMvp,
        milestoneId: "10000000-0000-4000-8000-000000000001",
        title: "Create project setup",
        description:
          "Set up repository, folder structure, and environment configuration.",
        status: "completed",
        priority: "high",
        dueDate: "2026-06-01",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "20000000-0000-4000-8000-000000000002",
        projectId: ids.projects.saasDashboardMvp,
        milestoneId: "10000000-0000-4000-8000-000000000002",
        title: "Build dashboard layout",
        description:
          "Create the main dashboard layout with project cards and progress sections.",
        status: "completed",
        priority: "high",
        dueDate: "2026-06-07",
        position: 2,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "20000000-0000-4000-8000-000000000003",
        projectId: ids.projects.saasDashboardMvp,
        milestoneId: "10000000-0000-4000-8000-000000000003",
        title: "Complete API integration",
        description:
          "Connect project progress, updates, files, and approval data to Supabase.",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-07-05",
        position: 3,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "20000000-0000-4000-8000-000000000004",
        projectId: ids.projects.clientPortalBuild,
        milestoneId: "10000000-0000-4000-8000-000000000004",
        title: "Implement billing module",
        description: "Add payment status cards and project payment history.",
        status: "todo",
        priority: "medium",
        dueDate: "2026-07-14",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "20000000-0000-4000-8000-000000000005",
        projectId: ids.projects.agencyWebsiteRedesign,
        milestoneId: "10000000-0000-4000-8000-000000000005",
        title: "Prepare final design changes",
        description:
          "Apply client feedback and prepare final approval request.",
        status: "in_progress",
        priority: "medium",
        dueDate: "2026-06-18",
        position: 1,
        isVisibleToClient: true,
        createdBy: adminId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(projectUpdates)
    .values([
      {
        id: "30000000-0000-4000-8000-000000000001",
        projectId: ids.projects.saasDashboardMvp,
        title: "Frontend Progress Update",
        body: "Completed the main dashboard layout and client-facing project overview. Components are responsive and match the design direction.",
        updateType: "progress",
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "30000000-0000-4000-8000-000000000002",
        projectId: ids.projects.clientPortalBuild,
        title: "Client Portal Structure Ready",
        body: "The base structure for the client portal is ready. Next step is authentication and project assignment logic.",
        updateType: "general",
        isVisibleToClient: true,
        createdBy: adminId,
      },
      {
        id: "30000000-0000-4000-8000-000000000003",
        projectId: ids.projects.agencyWebsiteRedesign,
        title: "Design Review Complete",
        body: "The main design review is complete. Final revisions are being prepared for approval.",
        updateType: "milestone",
        isVisibleToClient: true,
        createdBy: adminId,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(feedback)
    .values([
      {
        id: "50000000-0000-4000-8000-000000000001",
        projectId: ids.projects.saasDashboardMvp,
        clientId: ids.clients.novaAgency,
        createdBy: sarahId,
        message:
          "The dashboard design looks clean. Please adjust the analytics chart spacing slightly.",
        status: "open",
        isVisibleToClient: true,
      },
      {
        id: "50000000-0000-4000-8000-000000000002",
        projectId: ids.projects.clientPortalBuild,
        clientId: ids.clients.retailCo,
        createdBy: michaelId,
        message:
          "The portal flow makes sense. Can we make the payment section more visible?",
        status: "reviewed",
        adminResponse:
          "Yes, I will make the payment status easier to notice in the next update.",
        isVisibleToClient: true,
      },
      {
        id: "50000000-0000-4000-8000-000000000003",
        projectId: ids.projects.agencyWebsiteRedesign,
        clientId: ids.clients.creativeHub,
        createdBy: jamesId,
        message:
          "The homepage is much better now. Please make the call-to-action section stronger.",
        status: "open",
        isVisibleToClient: true,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(approvals)
    .values([
      {
        id: "60000000-0000-4000-8000-000000000001",
        projectId: ids.projects.saasDashboardMvp,
        milestoneId: "10000000-0000-4000-8000-000000000002",
        title: "Frontend Development Milestone",
        description:
          "The frontend development phase is complete and ready for your review.",
        status: "pending",
        requestedBy: adminId,
      },
      {
        id: "60000000-0000-4000-8000-000000000002",
        projectId: ids.projects.agencyWebsiteRedesign,
        milestoneId: "10000000-0000-4000-8000-000000000005",
        title: "Agency Website Design Review",
        description:
          "The redesigned homepage and services page are ready for review.",
        status: "changes_requested",
        requestedBy: adminId,
        respondedBy: jamesId,
        responseNote:
          "Please make the hero section message more direct before final approval.",
        respondedAt: new Date("2026-06-06T15:30:00.000Z"),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(payments)
    .values([
      {
        id: "40000000-0000-4000-8000-000000000001",
        projectId: ids.projects.saasDashboardMvp,
        amountCents: 150000,
        currency: "USD",
        status: "paid",
        dueDate: "2026-06-01",
        paidAt: new Date("2026-06-01T13:00:00.000Z"),
        notes: "Initial SaaS dashboard MVP deposit.",
      },
      {
        id: "40000000-0000-4000-8000-000000000002",
        projectId: ids.projects.saasDashboardMvp,
        amountCents: 90000,
        currency: "USD",
        status: "unpaid",
        dueDate: "2026-07-05",
        notes: "Backend API integration milestone payment.",
      },
      {
        id: "40000000-0000-4000-8000-000000000003",
        projectId: ids.projects.clientPortalBuild,
        amountCents: 220000,
        currency: "USD",
        status: "partial",
        dueDate: "2026-07-20",
        notes: "Client portal build payment, partial deposit received.",
      },
      {
        id: "40000000-0000-4000-8000-000000000004",
        projectId: ids.projects.agencyWebsiteRedesign,
        amountCents: 50000,
        currency: "USD",
        status: "paid",
        dueDate: "2026-06-03",
        paidAt: new Date("2026-06-03T11:00:00.000Z"),
        notes: "Agency website redesign design review payment.",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(projectFiles)
    .values([
      {
        id: "70000000-0000-4000-8000-000000000001",
        projectId: ids.projects.saasDashboardMvp,
        uploadedBy: adminId,
        fileName: "Project Brief.pdf",
        bucketName: "project-files",
        storagePath: "saas-dashboard-mvp/project-brief.pdf",
        fileType: "application/pdf",
        fileSize: 2400000,
        category: "brief",
        isVisibleToClient: true,
      },
      {
        id: "70000000-0000-4000-8000-000000000002",
        projectId: ids.projects.saasDashboardMvp,
        uploadedBy: adminId,
        fileName: "API Documentation.pdf",
        bucketName: "project-files",
        storagePath: "saas-dashboard-mvp/api-documentation.pdf",
        fileType: "application/pdf",
        fileSize: 1200000,
        category: "document",
        isVisibleToClient: true,
      },
      {
        id: "70000000-0000-4000-8000-000000000003",
        projectId: ids.projects.clientPortalBuild,
        uploadedBy: adminId,
        fileName: "Client Portal Wireframes.fig",
        bucketName: "project-files",
        storagePath: "client-portal-build/client-portal-wireframes.fig",
        fileType: "application/octet-stream",
        fileSize: 15800000,
        category: "design",
        isVisibleToClient: true,
      },
      {
        id: "70000000-0000-4000-8000-000000000004",
        projectId: ids.projects.agencyWebsiteRedesign,
        uploadedBy: adminId,
        fileName: "Homepage Review.pdf",
        bucketName: "project-files",
        storagePath: "agency-website-redesign/homepage-review.pdf",
        fileType: "application/pdf",
        fileSize: 1800000,
        category: "deliverable",
        isVisibleToClient: true,
      },
    ])
    .onConflictDoNothing();

  console.log("DeliverFlow seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });