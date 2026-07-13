export const routes = {
  home: "/",

  auth: {
    login: "/login",
    signup: "/signup",
  },

  invite: {
    accept: (token: string) => `/invite/${encodeURIComponent(token)}`,
  },

  admin: {
    dashboard: "/admin/dashboard",
    analytics: "/admin/analytics",
    clients: "/admin/clients",
    projects: "/admin/projects",
    notes: "/admin/notes",
    milestones: "/admin/milestones",
    tasks: "/admin/tasks",
    feedback: "/admin/feedback",
    payments: "/admin/payments",
    files: "/admin/files",
    approvals: "/admin/approvals",
    notifications: "/admin/notifications",
    settings: "/admin/settings",
    workspaceSettings: "/admin/settings/workspace",
    teamSettings: "/admin/settings/team",
  },

  client: {
    dashboard: "/client/dashboard",
    overview: "/client/overview",
    project: "/client/project",
    files: "/client/files",
    feedback: "/client/feedback",
    approvals: "/client/approvals",
    payments: "/client/payments",
    notifications: "/client/notifications",
    settings: "/client/settings",
  },
} as const;
