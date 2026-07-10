import { routes } from "@/config/routes";

export function buildClientProjectActionUrl(path: string, projectId: string) {
  const params = new URLSearchParams({
    projectId,
  });

  return `${path}?${params.toString()}`;
}

export function buildOwnerProjectActionUrl(projectId: string) {
  return `${routes.admin.projects}/${projectId}`;
}

export function getClientUpdateNotificationUrl(projectId: string) {
  return buildClientProjectActionUrl(routes.client.project, projectId);
}

export function getClientApprovalNotificationUrl(projectId: string) {
  return buildClientProjectActionUrl(routes.client.approvals, projectId);
}

export function getClientFileNotificationUrl(projectId: string) {
  return buildClientProjectActionUrl(routes.client.files, projectId);
}

export function getClientPaymentNotificationUrl(projectId: string) {
  return buildClientProjectActionUrl(routes.client.payments, projectId);
}

export function getOwnerFeedbackNotificationUrl(projectId: string) {
  return buildOwnerProjectActionUrl(projectId);
}

export function getOwnerApprovalResponseNotificationUrl(projectId: string) {
  return buildOwnerProjectActionUrl(projectId);
}
