export const analyticsRanges = ["30d", "90d", "6m", "12m"] as const;

export type AnalyticsRange = (typeof analyticsRanges)[number];
export type AnalyticsBucket = { key: string; label: string; start: string };
export type CurrencyAmount = { currency: string; amountCents: number };

export type AnalyticsProjectHealth = {
  id: string;
  name: string;
  clientName: string;
  status: "active" | "in_progress" | "waiting_feedback" | "completed";
  progress: number;
  deadline: string | null;
  openFeedbackCount: number;
  pendingApprovalCount: number;
  blockedTaskCount: number;
  openInvoices: CurrencyAmount[];
  health: "at_risk" | "needs_attention" | "on_track" | "completed";
};

export type AnalyticsClientActivity = {
  id: string;
  name: string;
  activeProjectCount: number;
  feedbackSubmitted: number;
  approvalResponses: number;
  recordedViews: number;
  openInvoices: CurrencyAmount[];
};

export type AnalyticsPageData = {
  range: AnalyticsRange;
  metrics: {
    paidRevenue: CurrencyAmount[];
    openInvoiceValue: CurrencyAmount[];
    approvalRate: number | null;
    averageApprovalResponseHours: number | null;
  };
  revenueByCurrency: Array<{
    currency: string;
    buckets: Array<
      AnalyticsBucket & { invoicedCents: number; paidCents: number }
    >;
  }>;
  deliveryBuckets: Array<
    AnalyticsBucket & {
      feedbackSubmitted: number;
      feedbackResolved: number;
      approvalRequests: number;
      approvalResponses: number;
    }
  >;
  paymentStatusByCurrency: Array<{
    currency: string;
    statuses: Array<{
      status: "paid" | "unpaid" | "partial" | "overdue";
      invoiceCount: number;
      amountCents: number;
    }>;
  }>;
  projectHealth: AnalyticsProjectHealth[];
  clientActivity: AnalyticsClientActivity[];
};
