"use client";

import { useCampaigns } from "../lib/useCampaigns";
import CampaignCard from "./CampaignCard";

// Live campaign grid for /campaigns. Active campaigns first, then ended ones.
export default function CampaignGrid({ showEnded = false }: { showEnded?: boolean }) {
  const { campaigns, loading } = useCampaigns();

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-neutral-500">
        Loading campaigns...
      </div>
    );
  }

  const active = campaigns.filter((c) => c.status !== "Ended");
  const ended = campaigns.filter((c) => c.status === "Ended");

  if (active.length === 0 && (!showEnded || ended.length === 0)) {
    return (
      <div className="rounded-xl border border-white/10 bg-neutral-900/30 p-10 text-center">
        <p className="text-sm text-neutral-500">No active campaigns right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {active.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((c) => (
            <CampaignCard key={c.id} c={c} />
          ))}
        </div>
      )}

      {showEnded && ended.length > 0 && (
        <div>
          <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.14em] text-neutral-500">
            Ended
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ended.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}