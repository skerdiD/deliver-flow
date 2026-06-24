import type {
  AdminMilestoneStatus,
  AdminPaymentStatus,
  AdminProject,
  AdminProjectClient,
  AdminProjectStatus,
  AdminTaskStatus,
} from "@/features/admin/projects/types";

export const projectClients: AdminProjectClient[] = [
  {
    id: "client_nova_agency",
    name: "Sarah Johnson",
    company: "Nova Agency",
    email: "sarah@novaagency.com",
  },
  {
    id: "client_retailco",
    name: "Michael Chen",
    company: "RetailCo",
    email: "michael@retailco.com",
  },
  {
    id: "client_creative_hub",
    name: "James Rodriguez",
    company: "Creative Hub",
    email: "james@creativehub.co",
  },
];

let projectsStore: AdminProject[] = [
  {
    id: "project_agency_redesign",
    name: "Agency Website Redesign",
    description:
      "A focused website redesign for a creative agency, including cleaner messaging, stronger service sections, and a final client approval flow.",
    client: projectClients[2],
    status: "waiting_feedback",
    progress: 90,
    deadline: "2026-06-25",
    liveDemoUrl: "https://demo.deliverflow.dev/agency-website-redesign",
    repositoryUrl: "https://github.com/example/agency-website-redesign",
    paymentStatus: "paid",
    budgetCents: 50000,
    paidCents: 50000,
    createdAt: "2026-05-28T10:00:00.000Z",
    milestones: [
      {
        id: "milestone_agency_1",
        title: "Homepage redesign",
        description: "Hero, services, proof section, and contact CTA updated.",
        status: "completed",
        dueDate: "2026-06-04",
      },
      {
        id: "milestone_agency_2",
        title: "Final design review",
        description: "Client review before the final handoff.",
        status: "waiting_approval",
        dueDate: "2026-06-18",
      },
    ],
    tasks: [
      {
        id: "task_agency_1",
        title: "Update hero copy",
        description: "Make the main headline more direct and client-focused.",
        status: "completed",
        dueDate: "2026-06-02",
      },
      {
        id: "task_agency_2",
        title: "Prepare final responsive pass",
        description: "Check tablet and mobile spacing before approval.",
        status: "in_progress",
        dueDate: "2026-06-18",
      },
    ],
    updates: [
      {
        id: "update_agency_1",
        title: "Design review is ready",
        body: "The main homepage sections are updated. The next step is reviewing the CTA section and confirming final changes.",
        createdAt: "2026-06-07T15:30:00.000Z",
      },
    ],
    feedback: [
      {
        id: "feedback_agency_1",
        clientName: "James Rodriguez",
        message:
          "The homepage is much better now. Please make the call-to-action section more direct.",
        status: "open",
        createdAt: "2026-06-06T13:00:00.000Z",
      },
    ],
    approval: {
      id: "approval_agency_1",
      title: "Agency website design review",
      status: "changes_requested",
      milestoneTitle: "Final design review",
      note: "Client wants the CTA section to be stronger before final approval.",
      responseNote:
        "Please make the call-to-action section more direct before final approval.",
      requestedAt: "2026-06-06T15:30:00.000Z",
      respondedAt: "2026-06-07T09:15:00.000Z",
    },
  },
  {
    id: "project_saas_mvp",
    name: "SaaS Dashboard MVP",
    description:
      "A SaaS-style dashboard MVP with authentication, analytics, project tracking, client-facing status, and admin workflows.",
    client: projectClients[0],
    status: "in_progress",
    progress: 68,
    deadline: "2026-07-15",
    liveDemoUrl: "https://demo.deliverflow.dev/saas-dashboard-mvp",
    repositoryUrl: "https://github.com/example/saas-dashboard-mvp",
    paymentStatus: "partial",
    budgetCents: 240000,
    paidCents: 150000,
    createdAt: "2026-06-01T09:00:00.000Z",
    milestones: [
      {
        id: "milestone_saas_1",
        title: "Project setup and planning",
        description: "Repository, app structure, and delivery plan completed.",
        status: "completed",
        dueDate: "2026-06-01",
      },
      {
        id: "milestone_saas_2",
        title: "Frontend dashboard screens",
        description: "Admin dashboard and project overview screens built.",
        status: "completed",
        dueDate: "2026-06-10",
      },
      {
        id: "milestone_saas_3",
        title: "Backend API integration",
        description: "Connect dashboard data and protected actions.",
        status: "in_progress",
        dueDate: "2026-07-05",
      },
    ],
    tasks: [
      {
        id: "task_saas_1",
        title: "Build dashboard layout",
        description: "Create the main admin overview and project cards.",
        status: "completed",
        dueDate: "2026-06-07",
      },
      {
        id: "task_saas_2",
        title: "Connect project data layer",
        description: "Prepare the project queries for Supabase replacement.",
        status: "in_progress",
        dueDate: "2026-06-20",
      },
      {
        id: "task_saas_3",
        title: "Add approval flow",
        description: "Let clients approve or request changes from their portal.",
        status: "todo",
        dueDate: "2026-07-02",
      },
    ],
    updates: [
      {
        id: "update_saas_1",
        title: "Dashboard screens completed",
        body: "The main dashboard layout is ready. Current work is focused on connecting project data and approval actions.",
        createdAt: "2026-06-08T10:00:00.000Z",
      },
      {
        id: "update_saas_2",
        title: "API work started",
        body: "Project progress, files, updates, and milestones are being prepared for Supabase integration.",
        createdAt: "2026-06-06T12:00:00.000Z",
      },
    ],
    feedback: [
      {
        id: "feedback_saas_1",
        clientName: "Sarah Johnson",
        message:
          "The dashboard looks clean. Please adjust the analytics chart spacing before the next review.",
        status: "open",
        createdAt: "2026-06-08T09:30:00.000Z",
      },
    ],
    approval: {
      id: "approval_saas_1",
      title: "Frontend development milestone",
      status: "pending",
      milestoneTitle: "Frontend dashboard screens",
      note: "Client needs to review the latest dashboard screens.",
      requestedAt: "2026-06-08T10:15:00.000Z",
    },
  },
  {
    id: "project_client_portal",
    name: "Client Portal Build",
    description:
      "A private client portal where customers can check progress, updates, files, approvals, payment status, and feedback.",
    client: projectClients[1],
    status: "active",
    progress: 45,
    deadline: "2026-08-20",
    liveDemoUrl: "https://demo.deliverflow.dev/client-portal-build",
    repositoryUrl: "https://github.com/example/client-portal-build",
    paymentStatus: "unpaid",
    budgetCents: 220000,
    paidCents: 0,
    createdAt: "2026-06-02T11:30:00.000Z",
    milestones: [
      {
        id: "milestone_portal_1",
        title: "Authentication and client access",
        description: "Set up login, roles, and client-only project visibility.",
        status: "in_progress",
        dueDate: "2026-07-10",
      },
    ],
    tasks: [
      {
        id: "task_portal_1",
        title: "Create client dashboard shell",
        description: "Build the main client portal layout and navigation.",
        status: "completed",
        dueDate: "2026-06-15",
      },
      {
        id: "task_portal_2",
        title: "Add files section",
        description: "Prepare file metadata cards and download actions.",
        status: "todo",
        dueDate: "2026-07-14",
      },
    ],
    updates: [
      {
        id: "update_portal_1",
        title: "Client portal structure ready",
        body: "The base portal layout is ready. Next step is connecting project assignment logic.",
        createdAt: "2026-06-06T12:00:00.000Z",
      },
    ],
    feedback: [
      {
        id: "feedback_portal_1",
        clientName: "Michael Chen",
        message:
          "The portal flow makes sense. Can we make the payment section easier to notice?",
        status: "reviewed",
        createdAt: "2026-06-07T16:20:00.000Z",
      },
    ],
    approval: {
      id: "approval_portal_1",
      title: "Authentication flow review",
      status: "pending",
      milestoneTitle: "Authentication and client access",
      note: "Waiting for client review after the next demo.",
      requestedAt: "2026-06-07T11:00:00.000Z",
    },
  },
];

export async function getAdminProjects() {
  return projectsStore.map(normalizeAdminProject);
}

export async function getAdminProjectById(id: string) {
  const project = projectsStore.find((item) => item.id === id);

  return project ? normalizeAdminProject(project) : null;
}

export async function getProjectClientOptions() {
  return projectClients;
}

export async function createAdminProject(input: {
  name: string;
  clientId: string;
  description: string;
  status: AdminProjectStatus;
  progress: number;
  deadline: string;
  liveDemoUrl?: string;
  repositoryUrl?: string;
  paymentStatus: AdminPaymentStatus;
  budgetDollars: number;
  paidDollars: number;
}): Promise<AdminProject> {
  const client = projectClients.find((item) => item.id === input.clientId);

  if (!client) {
    throw new Error("Client not found.");
  }

  const project: AdminProject = {
    id: `project_${Date.now()}`,
    name: input.name,
    client,
    description: input.description,
    status: input.status,
    progress: input.progress,
    deadline: input.deadline,
    liveDemoUrl: input.liveDemoUrl ?? "",
    repositoryUrl: input.repositoryUrl ?? "",
    paymentStatus: input.paymentStatus,
    budgetCents: Math.round(input.budgetDollars * 100),
    paidCents: Math.round(input.paidDollars * 100),
    createdAt: new Date().toISOString(),
    milestones: [],
    tasks: [],
    updates: [
      {
        id: `update_${Date.now()}`,
        title: "Project created",
        body: "The project workspace is ready. Add milestones, tasks, and updates as delivery starts.",
        createdAt: new Date().toISOString(),
        isVisibleToClient: true,
      },
    ],
    files: [],
    payments: [],
    feedback: [],
    approvals: [],
    approval: {
      id: `approval_${Date.now()}`,
      title: "First client review",
      status: "pending",
      note: "No approval requested yet.",
      requestedAt: new Date().toISOString(),
    },
  };

  projectsStore = [project, ...projectsStore];

  return project;
}

function normalizeAdminProject(project: AdminProject): AdminProject {
  const approvals =
    project.approvals ??
    (project.approval.note === "No approval requested yet."
      ? []
      : [project.approval]);

  return {
    ...project,
    milestones: project.milestones.map((milestone, index) => ({
      ...milestone,
      position: milestone.position ?? index + 1,
      approvalStatus:
        milestone.approvalStatus ??
        approvals.find(
          (approval) => approval.milestoneTitle === milestone.title,
        )?.status ??
        null,
    })),
    tasks: project.tasks.map((task) => ({
      ...task,
      priority: task.priority ?? "medium",
      isVisibleToClient: task.isVisibleToClient ?? true,
    })),
    updates: project.updates.map((update) => ({
      ...update,
      isVisibleToClient: update.isVisibleToClient ?? true,
    })),
    files: project.files ?? [],
    payments: project.payments ?? [],
    approvals,
  };
}

export async function updateAdminProject(
  id: string,
  input: {
    name: string;
    clientId: string;
    description: string;
    status: AdminProjectStatus;
    progress: number;
    deadline: string;
    liveDemoUrl?: string;
    repositoryUrl?: string;
    paymentStatus: AdminPaymentStatus;
    budgetDollars: number;
    paidDollars: number;
  },
): Promise<AdminProject | null> {
  const client = projectClients.find((item) => item.id === input.clientId);

  if (!client) {
    throw new Error("Client not found.");
  }

  let updatedProject: AdminProject | null = null;

  projectsStore = projectsStore.map((project) => {
    if (project.id !== id) {
      return project;
    }

    updatedProject = {
      ...project,
      name: input.name,
      client,
      description: input.description,
      status: input.status,
      progress: input.progress,
      deadline: input.deadline,
      liveDemoUrl: input.liveDemoUrl ?? "",
      repositoryUrl: input.repositoryUrl ?? "",
      paymentStatus: input.paymentStatus,
      budgetCents: Math.round(input.budgetDollars * 100),
      paidCents: Math.round(input.paidDollars * 100),
    };

    return updatedProject;
  });

  return updatedProject;
}

export async function updateProjectProgress(
  id: string,
  input: {
    progress: number;
    status: AdminProjectStatus;
  },
): Promise<AdminProject | null> {
  let updatedProject: AdminProject | null = null;

  projectsStore = projectsStore.map((project) => {
    if (project.id !== id) {
      return project;
    }

    updatedProject = {
      ...project,
      progress: input.progress,
      status: input.status,
    };

    return updatedProject;
  });

  return updatedProject;
}

export async function addProjectTask(
  projectId: string,
  input: {
    title: string;
    description: string;
    dueDate: string;
  },
): Promise<AdminProject | null> {
  let updatedProject: AdminProject | null = null;

  projectsStore = projectsStore.map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    updatedProject = {
      ...project,
      tasks: [
        {
          id: `task_${Date.now()}`,
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          status: "todo",
        },
        ...project.tasks,
      ],
    };

    return updatedProject;
  });

  return updatedProject;
}

export async function markProjectTaskComplete(projectId: string, taskId: string) {
  projectsStore = projectsStore.map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    return {
      ...project,
      tasks: project.tasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" as AdminTaskStatus } : task,
      ),
    };
  });
}

export async function addProjectMilestone(
  projectId: string,
  input: {
    title: string;
    description: string;
    dueDate: string;
  },
): Promise<AdminProject | null> {
  let updatedProject: AdminProject | null = null;

  projectsStore = projectsStore.map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    updatedProject = {
      ...project,
      milestones: [
        {
          id: `milestone_${Date.now()}`,
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          status: "not_started",
        },
        ...project.milestones,
      ],
    };

    return updatedProject;
  });

  return updatedProject;
}

export async function markProjectMilestoneComplete(
  projectId: string,
  milestoneId: string,
) {
  projectsStore = projectsStore.map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    return {
      ...project,
      milestones: project.milestones.map((milestone) =>
        milestone.id === milestoneId
          ? { ...milestone, status: "completed" as AdminMilestoneStatus }
          : milestone,
      ),
    };
  });
}

export async function addProjectUpdate(
  projectId: string,
  input: {
    title: string;
    body: string;
  },
): Promise<AdminProject | null> {
  let updatedProject: AdminProject | null = null;

  projectsStore = projectsStore.map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    updatedProject = {
      ...project,
      updates: [
        {
          id: `update_${Date.now()}`,
          title: input.title,
          body: input.body,
          createdAt: new Date().toISOString(),
        },
        ...project.updates,
      ],
    };

    return updatedProject;
  });

  return updatedProject;
}
