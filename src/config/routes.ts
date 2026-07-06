export const routes = {
  home: "/",

  auth: {
    login: "/login",
  },

  invite: {
    accept: (token: string) => `/invite/${encodeURIComponent(token)}`,
  },

  admin: {
    dashboard: "/admin/dashboard",
    clients: "/admin/clients",
    projects: "/admin/projects",
    notes: "/admin/notes",
    milestones: "/admin/milestones",
    tasks: "/admin/tasks",
    feedback: "/admin/feedback",
    payments: "/admin/payments",
    files: "/admin/files",
    approvals: "/admin/approvals",
    settings: "/admin/settings",
  },

  client: {
    dashboard: "/client/overview",
    legacyDashboard: "/client/dashboard",
    project: "/client/project",
    files: "/client/files",
    feedback: "/client/feedback",
    approvals: "/client/approvals",
    payments: "/client/payments",
  },
} as const;
