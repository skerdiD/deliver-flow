export const routes = {
  home: "/",

  auth: {
    login: "/login",
  },

  admin: {
    dashboard: "/admin/dashboard",
    clients: "/admin/clients",
    projects: "/admin/projects",
    tasks: "/admin/tasks",
    feedback: "/admin/feedback",
    payments: "/admin/payments",
    files: "/admin/files",
    approvals: "/admin/approvals",
    settings: "/admin/settings",
  },

  client: {
    dashboard: "/client/dashboard",
    project: "/client/project",
    files: "/client/files",
    feedback: "/client/feedback",
    payments: "/client/payments",
  },
} as const;
