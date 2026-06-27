import { relations } from "drizzle-orm";

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
} from "@/db/schema";

export const profilesRelations = relations(profiles, ({ many }) => ({
  ownedClients: many(clients, {
    relationName: "clientCreator",
  }),
  ownedProjects: many(projects, {
    relationName: "projectCreator",
  }),
  assignedProjects: many(projectAssignments, {
    relationName: "assignmentCreator",
  }),
  createdMilestones: many(milestones, {
    relationName: "milestoneCreator",
  }),
  createdTasks: many(tasks, {
    relationName: "taskCreator",
  }),
  createdUpdates: many(projectUpdates, {
    relationName: "updateCreator",
  }),
  createdFeedback: many(feedback, {
    relationName: "feedbackCreator",
  }),
  requestedApprovals: many(approvals, {
    relationName: "approvalRequester",
  }),
  respondedApprovals: many(approvals, {
    relationName: "approvalResponder",
  }),
  uploadedFiles: many(projectFiles, {
    relationName: "fileUploader",
  }),
  projectActivity: many(projectActivity, {
    relationName: "activityActor",
  }),
  projectViewEvents: many(projectViewEvents, {
    relationName: "viewEventUser",
  }),
  sentClientInvitations: many(clientInvitations, {
    relationName: "clientInvitationSender",
  }),
  acceptedClientInvitations: many(clientInvitations, {
    relationName: "clientInvitationAcceptor",
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [clients.profileId],
    references: [profiles.id],
    relationName: "clientProfile",
  }),
  creator: one(profiles, {
    fields: [clients.createdBy],
    references: [profiles.id],
    relationName: "clientCreator",
  }),
  projectAssignments: many(projectAssignments),
  feedback: many(feedback),
  invitations: many(clientInvitations),
  viewEvents: many(projectViewEvents),
}));

export const clientInvitationsRelations = relations(
  clientInvitations,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientInvitations.clientId],
      references: [clients.id],
    }),
    inviter: one(profiles, {
      fields: [clientInvitations.invitedBy],
      references: [profiles.id],
      relationName: "clientInvitationSender",
    }),
    accepter: one(profiles, {
      fields: [clientInvitations.acceptedBy],
      references: [profiles.id],
      relationName: "clientInvitationAcceptor",
    }),
  }),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(profiles, {
    fields: [projects.createdBy],
    references: [profiles.id],
    relationName: "projectCreator",
  }),
  assignments: many(projectAssignments),
  milestones: many(milestones),
  tasks: many(tasks),
  updates: many(projectUpdates),
  feedback: many(feedback),
  approvals: many(approvals),
  payments: many(payments),
  files: many(projectFiles),
  activity: many(projectActivity),
  viewEvents: many(projectViewEvents),
}));

export const projectActivityRelations = relations(
  projectActivity,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectActivity.projectId],
      references: [projects.id],
    }),
    actor: one(profiles, {
      fields: [projectActivity.actorId],
      references: [profiles.id],
      relationName: "activityActor",
    }),
  }),
);

export const projectViewEventsRelations = relations(
  projectViewEvents,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectViewEvents.projectId],
      references: [projects.id],
    }),
    client: one(clients, {
      fields: [projectViewEvents.clientId],
      references: [clients.id],
    }),
    user: one(profiles, {
      fields: [projectViewEvents.userId],
      references: [profiles.id],
      relationName: "viewEventUser",
    }),
  }),
);

export const projectAssignmentsRelations = relations(
  projectAssignments,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectAssignments.projectId],
      references: [projects.id],
    }),
    client: one(clients, {
      fields: [projectAssignments.clientId],
      references: [clients.id],
    }),
    assignedByProfile: one(profiles, {
      fields: [projectAssignments.assignedBy],
      references: [profiles.id],
      relationName: "assignmentCreator",
    }),
  }),
);

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
  creator: one(profiles, {
    fields: [milestones.createdBy],
    references: [profiles.id],
    relationName: "milestoneCreator",
  }),
  tasks: many(tasks),
  approvals: many(approvals),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  milestone: one(milestones, {
    fields: [tasks.milestoneId],
    references: [milestones.id],
  }),
  creator: one(profiles, {
    fields: [tasks.createdBy],
    references: [profiles.id],
    relationName: "taskCreator",
  }),
}));

export const projectUpdatesRelations = relations(projectUpdates, ({ one }) => ({
  project: one(projects, {
    fields: [projectUpdates.projectId],
    references: [projects.id],
  }),
  creator: one(profiles, {
    fields: [projectUpdates.createdBy],
    references: [profiles.id],
    relationName: "updateCreator",
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  project: one(projects, {
    fields: [feedback.projectId],
    references: [projects.id],
  }),
  client: one(clients, {
    fields: [feedback.clientId],
    references: [clients.id],
  }),
  creator: one(profiles, {
    fields: [feedback.createdBy],
    references: [profiles.id],
    relationName: "feedbackCreator",
  }),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  project: one(projects, {
    fields: [approvals.projectId],
    references: [projects.id],
  }),
  milestone: one(milestones, {
    fields: [approvals.milestoneId],
    references: [milestones.id],
  }),
  requester: one(profiles, {
    fields: [approvals.requestedBy],
    references: [profiles.id],
    relationName: "approvalRequester",
  }),
  responder: one(profiles, {
    fields: [approvals.respondedBy],
    references: [profiles.id],
    relationName: "approvalResponder",
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  project: one(projects, {
    fields: [payments.projectId],
    references: [projects.id],
  }),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
  uploader: one(profiles, {
    fields: [projectFiles.uploadedBy],
    references: [profiles.id],
    relationName: "fileUploader",
  }),
}));
