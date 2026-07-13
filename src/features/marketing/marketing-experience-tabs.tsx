"use client";

import { LayoutDashboard, UsersRound } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ExperienceTabsProps = {
  ownerPanel: ReactNode;
  clientPanel: ReactNode;
};

export function MarketingExperienceTabs({
  ownerPanel,
  clientPanel,
}: ExperienceTabsProps) {
  const [activeTab, setActiveTab] = useState<"owner" | "client">("owner");
  const id = useId();
  const ownerTabId = `${id}-owner-tab`;
  const clientTabId = `${id}-client-tab`;
  const ownerPanelId = `${id}-owner-panel`;
  const clientPanelId = `${id}-client-panel`;

  const tabs = [
    { id: "owner", label: "Owner workspace", icon: LayoutDashboard },
    { id: "client", label: "Client portal", icon: UsersRound },
  ] as const;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-2.5 shadow-[0_32px_90px_-50px_rgba(0,0,0,0.8)] sm:p-4">
      <div
        className="mx-auto mb-3 grid max-w-md grid-cols-2 rounded-xl border border-white/10 bg-slate-950/70 p-1"
        role="tablist"
        aria-label="DeliverFlow product experience"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={tab.id === "owner" ? ownerTabId : clientTabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={tab.id === "owner" ? ownerPanelId : clientPanelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                isActive
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "owner" ? (
        <div
          key="owner"
          id={ownerPanelId}
          role="tabpanel"
          aria-labelledby={ownerTabId}
          className="marketing-tab-panel rounded-[1.45rem] border border-white/10 bg-slate-950 p-5 text-white sm:p-7 lg:p-8"
        >
          {ownerPanel}
        </div>
      ) : (
        <div
          key="client"
          id={clientPanelId}
          role="tabpanel"
          aria-labelledby={clientTabId}
          className="marketing-tab-panel rounded-[1.45rem] border border-blue-100 bg-blue-50 p-5 sm:p-7 lg:p-8"
        >
          {clientPanel}
        </div>
      )}
    </div>
  );
}
