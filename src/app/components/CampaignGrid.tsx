"use client";

import { useCampaigns } from "../lib/useCampaigns";
import CampaignCard from "./CampaignCard";

// Presentation only. Data comes from useCampaigns (Supabase), unchanged.

function SectionHeading({
  id,
  tone,
  title,
  description,
}: {
  id: string;
  tone: "live" | "ended";
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <span
        aria-hidden="true"
        className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
          tone === "live" ? "bg-orange-500" : "bg-neutral-600"
        }`}
      />
      <div>
        <h2 id={id} className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black p-10 text-center">
      <p className="text-sm text-neutral-500">{children}</p>
    </div>
  );
}

export default function CampaignGrid({ showEnded = false }: { showEnded?: boolean }) {
  const { campaigns, loading } = useCampaigns();

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-neutral-500">
        Loading campaigns…
      </div>
    );
  }

  const live = campaigns.filter((c) => c.status !== "Ended");
  const ended = campaigns.filter((c) => c.status === "Ended");

  return (
    <div className="space-y-20">
      {/* Scoped hover for cards; the global border rule would otherwise win. */}
      <style>{`.cc-card{transition:border-color .25s ease}.cc-card:hover{border-color:rgba(255,255,255,.18)}`}</style>

      <section aria-labelledby="live-campaigns">
        <SectionHeading
          id="live-campaigns"
          tone="live"
          title="Live Campaigns"
          description="Make something unhinged. The community decides what wins."
        />

        {live.length === 0 ? (
          <EmptyState>No live campaigns right now.</EmptyState>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </section>

      {showEnded && ended.length > 0 && (
        <section
          aria-labelledby="ended-campaigns"
          className="border-t border-white/[0.08] pt-16"
        >
          <SectionHeading
            id="ended-campaigns"
            tone="ended"
            title="Ended Campaigns"
            description="Campaigns are over. See the results and how the community voted."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ended.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}