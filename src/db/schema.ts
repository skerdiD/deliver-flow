import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  json,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email"),
});

export const appRoleEnum = pgEnum("app_role", ["admin", "client"]);

export const clientStatusEnum = pgEnum("client_status", [
  "active",
  "inactive",
  "archived",
]);

export const clientInvitationStatusEnum = pgEnum(
  "client_invitation_status",
  ["pending", "accepted", "expired"],
);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "active",
  "in_progress",
  "waiting_feedback",
  "completed",
  "archived",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "not_started",
  "in_progress",
  "waiting_approval",
  "approved",
  "completed",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "blocked",
  "completed",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const projectUpdateTypeEnum = pgEnum("project_update_type", [
  "general",
  "progress",
  "milestone",
  "payment",
  "file",
  "approval",
]);

export const feedbackStatusEnum = pgEnum("feedback_status", [
  "open",
  "reviewed",
  "resolved",
]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "changes_requested",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "partial",
  "paid",
  "overdue",
]);

export const projectFileCategoryEnum = pgEnum("project_file_category", [
  "brief",
  "design",
  "document",
  "invoice",
  "deliverable",
  "other",
]);

export const projectActivityActorRoleEnum = pgEnum(
  "project_activity_actor_role",
  ["admin", "client", "system"],
);

export const projectViewTargetTypeEnum = pgEnum("project_view_target_type", [
  "project",
  "update",
  "file",
  "approval",
  "payment",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  role: appRoleEnum("role").notNull().default("client"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    profileId: uuid("profile_id")
      .unique()
      .references(() => profiles.id, { onDelete: "set null" }),
    companyName: text("company_name").notNull(),
    contactName: text("contact_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    status: clientStatusEnum("status").notNull().default("active"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    profileIdIdx: index("clients_profile_id_idx").on(table.profileId),
    createdByIdx: index("clients_created_by_idx").on(table.createdBy),
    statusIdx: index("clients_status_idx").on(table.status),
    createdAtIdx: index("clients_created_at_idx").on(table.createdAt),
  }),
);

export const clientInvitations = pgTable(
  "client_invitations",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    clientId: uuid("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    tokenHash: text("token_hash").notNull().unique(),
    status: clientInvitationStatusEnum("status")
      .notNull()
      .default("pending"),
    invitedBy: uuid("invited_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    acceptedBy: uuid("accepted_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailStatusIdx: index("client_invitations_email_status_idx").on(
      table.email,
      table.status,
    ),
    clientIdIdx: index("client_invitations_client_id_idx").on(table.clientId),
    statusExpiresAtIdx: index("client_invitations_status_expires_at_idx").on(
      table.status,
      table.expiresAt,
    ),
  }),
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    status: projectStatusEnum("status").notNull().default("draft"),
    progress: integer("progress").notNull().default(0),
    liveDemoUrl: text("live_demo_url"),
    repositoryUrl: text("repository_url"),
    deadline: date("deadline"),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    progressCheck: check(
      "projects_progress_check",
      sql`${table.progress} >= 0 AND ${table.progress} <= 100`,
    ),
    createdByIdx: index("projects_created_by_idx").on(table.createdBy),
    statusIdx: index("projects_status_idx").on(table.status),
    statusUpdatedAtIdx: index("projects_status_updated_at_idx").on(
      table.status,
      table.updatedAt,
    ),
  }),
);

export const projectAssignments = pgTable(
  "project_assignments",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    assignedBy: uuid("assigned_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueProjectClient: unique("project_assignments_project_client_unique").on(
      table.projectId,
      table.clientId,
    ),
    projectIdIdx: index("project_assignments_project_id_idx").on(
      table.projectId,
    ),
    clientIdIdx: index("project_assignments_client_id_idx").on(table.clientId),
    clientAssignedAtIdx: index("project_assignments_client_assigned_at_idx").on(
      table.clientId,
      table.assignedAt,
    ),
  }),
);

export const projectActivity = pgTable(
  "project_activity",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    actorName: text("actor_name"),
    actorRole: projectActivityActorRoleEnum("actor_role")
      .notNull()
      .default("system"),
    type: text("type").notNull(),
    message: text("message").notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectCreatedAtIdx: index("project_activity_project_created_at_idx").on(
      table.projectId,
      table.createdAt,
    ),
    actorIdIdx: index("project_activity_actor_id_idx").on(table.actorId),
    typeIdx: index("project_activity_type_idx").on(table.type),
  }),
);

export const projectViewEvents = pgTable(
  "project_view_events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    targetType: projectViewTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id"),
    viewedAt: timestamp("viewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueClientTarget: unique("project_view_events_client_target_unique").on(
      table.projectId,
      table.clientId,
      table.targetType,
      table.targetId,
    ),
    projectViewedAtIdx: index("project_view_events_project_viewed_at_idx").on(
      table.projectId,
      table.viewedAt,
    ),
    clientViewedAtIdx: index("project_view_events_client_viewed_at_idx").on(
      table.clientId,
      table.viewedAt,
    ),
    targetIdx: index("project_view_events_target_idx").on(
      table.targetType,
      table.targetId,
    ),
  }),
);

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: milestoneStatusEnum("status").notNull().default("not_started"),
    dueDate: date("due_date"),
    position: integer("position").notNull().default(0),
    isVisibleToClient: boolean("is_visible_to_client").notNull().default(true),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectIdIdx: index("milestones_project_id_idx").on(table.projectId),
    projectVisiblePositionIdx: index("milestones_project_visible_pos_idx").on(
      table.projectId,
      table.isVisibleToClient,
      table.position,
    ),
    projectStatusIdx: index("milestones_project_status_idx").on(
      table.projectId,
      table.status,
    ),
  }),
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id").references(() => milestones.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    dueDate: date("due_date"),
    position: integer("position").notNull().default(0),
    isVisibleToClient: boolean("is_visible_to_client").notNull().default(true),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectIdIdx: index("tasks_project_id_idx").on(table.projectId),
    milestoneIdIdx: index("tasks_milestone_id_idx").on(table.milestoneId),
    projectStatusIdx: index("tasks_project_status_idx").on(
      table.projectId,
      table.status,
    ),
    projectVisiblePositionIdx: index("tasks_project_visible_pos_idx").on(
      table.projectId,
      table.isVisibleToClient,
      table.position,
    ),
  }),
);

export const projectUpdates = pgTable(
  "project_updates",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    updateType: projectUpdateTypeEnum("update_type")
      .notNull()
      .default("general"),
    isVisibleToClient: boolean("is_visible_to_client").notNull().default(true),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectIdIdx: index("project_updates_project_id_idx").on(table.projectId),
    projectVisibleCreatedAtIdx: index(
      "project_updates_project_visible_created_at_idx",
    ).on(table.projectId, table.isVisibleToClient, table.createdAt),
  }),
);

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    message: text("message").notNull(),
    status: feedbackStatusEnum("status").notNull().default("open"),
    adminResponse: text("admin_response"),
    isVisibleToClient: boolean("is_visible_to_client").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectIdIdx: index("feedback_project_id_idx").on(table.projectId),
    clientIdIdx: index("feedback_client_id_idx").on(table.clientId),
    projectClientCreatedAtIdx: index("feedback_project_client_created_at_idx").on(
      table.projectId,
      table.clientId,
      table.createdAt,
    ),
    statusCreatedAtIdx: index("feedback_status_created_at_idx").on(
      table.status,
      table.createdAt,
    ),
  }),
);

export const approvals = pgTable(
  "approvals",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id").references(() => milestones.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    status: approvalStatusEnum("status").notNull().default("pending"),
    requestedBy: uuid("requested_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    respondedBy: uuid("responded_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    responseNote: text("response_note"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectIdIdx: index("approvals_project_id_idx").on(table.projectId),
    milestoneIdIdx: index("approvals_milestone_id_idx").on(table.milestoneId),
    projectStatusRequestedAtIdx: index(
      "approvals_project_status_requested_at_idx",
    ).on(table.projectId, table.status, table.requestedAt),
    statusRequestedAtIdx: index("approvals_status_requested_at_idx").on(
      table.status,
      table.requestedAt,
    ),
  }),
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    status: paymentStatusEnum("status").notNull().default("unpaid"),
    dueDate: date("due_date"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    amountCentsCheck: check(
      "payments_amount_cents_check",
      sql`${table.amountCents} > 0`,
    ),
    projectIdIdx: index("payments_project_id_idx").on(table.projectId),
    projectStatusDueDateIdx: index("payments_project_status_due_date_idx").on(
      table.projectId,
      table.status,
      table.dueDate,
    ),
    statusDueDateIdx: index("payments_status_due_date_idx").on(
      table.status,
      table.dueDate,
    ),
  }),
);

export const projectFiles = pgTable(
  "project_files",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    uploadedBy: uuid("uploaded_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    fileName: text("file_name").notNull(),
    bucketName: text("bucket_name").notNull().default("project-files"),
    storagePath: text("storage_path").notNull(),
    fileType: text("file_type"),
    fileSize: integer("file_size"),
    category: projectFileCategoryEnum("category").notNull().default("other"),
    isVisibleToClient: boolean("is_visible_to_client").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fileSizeCheck: check(
      "project_files_file_size_check",
      sql`${table.fileSize} IS NULL OR ${table.fileSize} >= 0`,
    ),
    projectIdIdx: index("project_files_project_id_idx").on(table.projectId),
    projectVisibleCreatedAtIdx: index(
      "project_files_project_visible_created_at_idx",
    ).on(table.projectId, table.isVisibleToClient, table.createdAt),
    uploadedByIdx: index("project_files_uploaded_by_idx").on(table.uploadedBy),
    uniqueStorageObject: unique("project_files_bucket_path_unique").on(
      table.bucketName,
      table.storagePath,
    ),
  }),
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type ClientInvitation = typeof clientInvitations.$inferSelect;
export type NewClientInvitation = typeof clientInvitations.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type NewProjectAssignment = typeof projectAssignments.$inferInsert;

export type ProjectActivity = typeof projectActivity.$inferSelect;
export type NewProjectActivity = typeof projectActivity.$inferInsert;

export type ProjectViewEvent = typeof projectViewEvents.$inferSelect;
export type NewProjectViewEvent = typeof projectViewEvents.$inferInsert;

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type NewProjectUpdate = typeof projectUpdates.$inferInsert;

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type ProjectFile = typeof projectFiles.$inferSelect;
export type NewProjectFile = typeof projectFiles.$inferInsert;
