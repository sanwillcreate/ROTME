"use client";

import Link from "next/link";
import {
  Campaign,
  campaignRules,
  getLeaderboard,
  getSubmissions,
} from "./data";

// ============================================================
// PRIMITIVES
// ============================================================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500/80">
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: Campaign["status"] }) {
  const isEnded = status === "Ended";
  const isEndingSoon = status === "Ending soon";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        isEnded
          ? "border-white/15 bg-white/[0.04] text-neutral-400"
          : isEndingSoon
            ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
            : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
      }`}
    >
      {status}
    </span>
  );
}

// ============================================================
// HEADER
// ============================================================

function CampaignHeader({ campaign }: { campaign: Campaign }) {
  return (
    <section className="border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-8 pb-12">
        <Link
          href="/#campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          ← Back to campaigns
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-sm font-semibold text-neutral-200">
            {campaign.initial}
          </div>

          <span className="text-sm text-neutral-400">{campaign.brand}</span>
          <span className="text-neutral-700">·</span>

          <span className="text-xs uppercase tracking-wide text-neutral-500">
            {campaign.category}
          </span>

          <StatusBadge status={campaign.status} />
        </div>

        <h1 className="mt-5 max-w-2xl text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-neutral-50 leading-[1.05]">
          {campaign.title}
        </h1>

        <p className="mt-4 max-w-xl text-base sm:text-lg text-neutral-400 leading-relaxed">
          {campaign.description}
        </p>
        {campaign.productName && (
  <div className="mt-5">
    <span className="text-xs uppercase tracking-[0.14em] text-neutral-600">
      Product
    </span>
    <p className="mt-1 text-sm font-medium text-neutral-300">
      {campaign.productName}
    </p>
  </div>
)}

{campaign.creatorBrief && (
  <div className="mt-7 max-w-2xl rounded-xl border border-orange-500/15 bg-orange-500/[0.035] p-5">
    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500/80">
      Creator brief
    </div>

    <p className="mt-2 text-sm leading-relaxed text-neutral-300">
      {campaign.creatorBrief}
    </p>
  </div>
)}

        <div className="mt-8 flex flex-wrap gap-3">
  {campaign.status === "Ended" ? (
    <Link
      href={`/campaign/${campaign.id}/pick`}
      className="inline-flex rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
    >
      View Final Results →
    </Link>
  ) : (
    <>
      <Link
        href={`/campaign/${campaign.id}/submit`}
        className="inline-flex rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
      >
        Submit a Meme
      </Link>

      <Link
        href={`/campaign/${campaign.id}/pick`}
        className="inline-flex rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/5"
      >
        Pick the Top 5 →
      </Link>
    </>
  )}
</div>

        <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-neutral-500">
          <div>
            <div className="text-xl font-semibold text-neutral-100">
              {campaign.prize}
            </div>
            <div>prize pool</div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div>
            <div className="text-xl font-semibold text-neutral-100">
              {campaign.submissions}
            </div>
            <div>submissions</div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div>
            <div className="text-xl font-semibold text-neutral-100">
              {campaign.remaining.split(" ")[0]}
            </div>
            <div>remaining</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// RULES
// ============================================================

function CampaignRules({ campaign }: { campaign: Campaign }) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/30 p-6 sm:p-7">
      <h2 className="text-lg font-semibold text-neutral-50">
        Campaign rules
      </h2>

      <ul className="mt-4 space-y-2.5">
        {(campaign.rules?.length ? campaign.rules : campaignRules).map((rule) => (
          <li
            key={rule}
            className="flex items-start gap-2.5 text-sm text-neutral-400"
          >
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-600" />
            {rule}
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-white/[0.06] pt-5">
        <h3 className="text-sm font-semibold text-neutral-200">
          How judging works
        </h3>

        <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
          Approved submissions are shown to the community below. Every vote
          counts toward a meme&apos;s score, and the campaign leaderboard
          updates as votes come in. When the campaign ends, the top-scoring
          memes take the prize pool.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SUBMIT MEME
// ============================================================

function SubmitMeme({ campaignId }: { campaignId: string }) {
  return (
    <div
      id="submit"
      className="rounded-xl border border-white/10 bg-neutral-900/30 p-6 sm:p-7"
    >
      <h2 className="text-lg font-semibold text-neutral-50">
        Submit your meme
      </h2>

      <p className="mt-1 text-sm text-neutral-500">
        Think you&apos;ve got something better?
      </p>

      <Link
        href={`/campaign/${campaignId}/submit`}
        className="mt-6 inline-flex rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
      >
        Submit a meme
      </Link>
    </div>
  );
}

// ============================================================
// SUBMISSIONS GRID
// ============================================================

function SubmissionsGrid({
  campaignId,
  dynamic,
}: {
  campaignId: string;
  dynamic?: boolean;
}) {
  const submissions = dynamic ? [] : getSubmissions(campaignId);
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-50">
        Approved submissions
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {submissions.map((s) => (
          <div
            key={s.submissionNo}
            className="group rounded-xl border border-white/10 bg-neutral-900/40 p-4 transition-colors hover:border-white/20 hover:bg-neutral-900/70"
          >
            <div
              className={`relative h-32 rounded-lg bg-gradient-to-br ${s.tone} border border-white/10`}
            >
              {s.featured && (
                <span className="absolute top-2 left-2 rounded-full border border-orange-500/30 bg-neutral-950/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                  #1
                </span>
              )}
            </div>

            <p className="mt-3 truncate text-sm text-neutral-300">
              &quot;{s.caption}&quot;
            </p>

            <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
              <span>
                @{s.creator} · #{s.submissionNo}
              </span>

              <span className="font-medium text-neutral-300">
                {s.votes} votes
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// LEADERBOARD
// ============================================================

function CampaignLeaderboard({
  campaignId,
  dynamic,
}: {
  campaignId: string;
  dynamic?: boolean;
}) {
  const leaderboard = dynamic ? [] : getLeaderboard(campaignId);

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-50">
        Campaign leaderboard
      </h2>

      <div className="mt-5 rounded-xl border border-white/10 bg-neutral-900/30 px-5 sm:px-6">
        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center justify-between border-b border-white/[0.06] py-4 last:border-b-0 transition-colors hover:bg-white/[0.02] -mx-5 sm:-mx-6 px-5 sm:px-6"
          >
            <div className="flex items-center gap-4">
              <span className="w-6 text-sm font-semibold text-neutral-500">
                {entry.rank}
              </span>

              <span className="text-sm text-neutral-100">
                @{entry.handle}
              </span>
            </div>

            <span className="text-sm font-medium text-neutral-300">
              {entry.votes} votes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================

function CampaignSidebar({ campaign }: { campaign: Campaign }) {
  const rows = [
    { label: "Prize pool", value: campaign.prize },
    { label: "Ends in", value: campaign.remaining.split(" ")[0] },
    { label: "Submissions", value: String(campaign.submissions) },
    { label: "Judging", value: "Community voting" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/30 p-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <SectionLabel>Campaign info</SectionLabel>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="mt-5 divide-y divide-white/[0.06]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <span className="text-sm text-neutral-500">
              {row.label}
            </span>

            <span className="text-sm font-medium text-neutral-100">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <a
        href={`/campaign/${campaign.id}/submit`}
        className="mt-6 block w-full rounded-lg bg-orange-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
      >
        Submit a Meme
      </a>

      <Link
        href={`/campaign/${campaign.id}/pick`}
        className="mt-3 block w-full rounded-lg border border-white/15 py-2.5 text-center text-sm font-semibold text-neutral-200 hover:bg-white/5 transition-colors"
      >
        Pick the Top 5 →
      </Link>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function CampaignDetail({
  campaign,
}: {
  campaign: Campaign;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <CampaignHeader campaign={campaign} />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-start">
          <div className="space-y-14">
            <CampaignRules campaign={campaign} />

           

            <SubmitMeme campaignId={campaign.id} />

            <SubmissionsGrid
  campaignId={campaign.id}
  dynamic={campaign.dynamic}
/>

<CampaignLeaderboard
  campaignId={campaign.id}
  dynamic={campaign.dynamic}
/>
          </div>

          <CampaignSidebar campaign={campaign} />
        </div>
      </section>
    </main>
  );
}