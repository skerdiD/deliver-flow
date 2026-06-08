export const routes = {
  home: "/",

  auth: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    forgotPassword: "/forgot-password",
  },

  admin: {
    dashboard: "/admin",
    clients: "/admin/clients",
    projects: "/admin/projects",
    tasks: "/admin/tasks",
    feedback: "/admin/feedback",
    payments: "/admin/payments",
    settings: "/admin/settings",
  },

  client: {
    dashboard: "/portal",
    project: "/portal/project",
    files: "/portal/files",
    feedback: "/portal/feedback",
  },
} as const;