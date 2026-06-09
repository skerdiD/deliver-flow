import type {
  AdminClient,
  AdminClientStatus,
} from "@/features/admin/clients/types";

let clientsStore: AdminClient[] = [
  {
    id: "client_nova_agency",
    name: "Sarah Johnson",
    company: "Nova Agency",
    email: "sarah@novaagency.com",
    status: "active",
    activeProjects: 1,
    totalPaidCents: 150000,
    latestActivity: "Left feedback on SaaS Dashboard MVP",
    createdAt: "2026-06-01T09:00:00.000Z",
    projects: [
      {
        id: "project_saas_mvp",
        name: "SaaS Dashboard MVP",
        status: "in_progress",
        progress: 68,
        budgetCents: 240000,
        paidCents: 150000,
        nextMilestone: "Backend API integration",
        deadline: "2026-07-15",
      },
    ],
  },
  {
    id: "client_retailco",
    name: "Michael Chen",
    company: "RetailCo",
    email: "michael@retailco.com",
    status: "active",
    activeProjects: 1,
    totalPaidCents: 0,
    latestActivity: "Asked about payment section visibility",
    createdAt: "2026-06-02T11:30:00.000Z",
    projects: [
      {
        id: "project_client_portal",
        name: "Client Portal Build",
        status: "active",
        progress: 45,
        budgetCents: 220000,
        paidCents: 0,
        nextMilestone: "Authentication and client access",
        deadline: "2026-08-20",
      },
    ],
  },
  {
    id: "client_creative_hub",
    name: "James Rodriguez",
    company: "Creative Hub",
    email: "james@creativehub.co",
    status: "paused",
    activeProjects: 1,
    totalPaidCents: 50000,
    latestActivity: "Requested stronger homepage CTA",
    createdAt: "2026-05-28T14:15:00.000Z",
    projects: [
      {
        id: "project_agency_redesign",
        name: "Agency Website Redesign",
        status: "waiting_feedback",
        progress: 90,
        budgetCents: 50000,
        paidCents: 50000,
        nextMilestone: "Final design review",
        deadline: "2026-06-25",
      },
    ],
  },
];

export async function getAdminClients() {
  return clientsStore;
}

export async function getAdminClientById(id: string) {
  return clientsStore.find((client) => client.id === id) ?? null;
}

export async function createAdminClient(input: {
  name: string;
  email: string;
  company?: string;
  status: AdminClientStatus;
}): Promise<AdminClient> {
  const client: AdminClient = {
    id: `client_${Date.now()}`,
    name: input.name,
    email: input.email,
    company: input.company?.trim() ? input.company.trim() : null,
    status: input.status,
    activeProjects: 0,
    totalPaidCents: 0,
    latestActivity: "Client added today",
    createdAt: new Date().toISOString(),
    projects: [],
  };

  clientsStore = [client, ...clientsStore];

  return client;
}

export async function updateAdminClient(
  id: string,
  input: {
    name: string;
    email: string;
    company?: string;
    status: AdminClientStatus;
  },
): Promise<AdminClient | null> {
  let updatedClient: AdminClient | null = null;

  clientsStore = clientsStore.map((client) => {
    if (client.id !== id) {
      return client;
    }

    updatedClient = {
      ...client,
      name: input.name,
      email: input.email,
      company: input.company?.trim() ? input.company.trim() : null,
      status: input.status,
      latestActivity: "Client profile updated today",
    };

    return updatedClient;
  });

  return updatedClient;
}
