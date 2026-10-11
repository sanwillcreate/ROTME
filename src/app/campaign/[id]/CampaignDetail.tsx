"use client";

import Link from "next/link";
import {
  Campaign,
  campaignRules,
  getLeaderboard,
  getSubmissions,
} from "./data";

// Orange and neutral outlines are inline: the global `* { border-color }`
// rule in globals.css overrides border-orange-* utilities.
const ORANGE = "#f97316";
const ORANGE_LINE = "rgba(249,115,22,0.35)";
const NEUTRAL_LINE = "rgba(255,255,255,0.14)";

const ANTON = "font-[family-name:var(--font-anton)]";
const GEIST = "font-[family-name:var(--font-geist-sans)]";

// Server-supplied, real approved submissions for database campaigns.
export type ApprovedSubmission = {
  id: string;
  caption: string;
  mediaUrl: string | null;
  postedAgo: string;
};

// The route supplies remaining as "3d 4h remaining". Display without suffix.
function timeLeftOf(campaign: Campaign): string {
  return campaign.remaining.replace(/ remaining$/, "");
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function StatusPill({ status }: { status: Campaign["status"] }) {
  const ended = status === "Ended";
  const endingSoon = status === "Ending soon";

  return (
    <span
      style={{ borderColor: endingSoon ? ORANGE_LINE : NEUTRAL_LINE }}
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        endingSoon
          ? "text-orange-400"
          : ended
            ? "bg-white/[0.03] text-neutral-400"
            : "text-emerald-400"
      }`}
    >
      {status}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-white">
      {children}
    </h2>
  );
}

// ============================================================
// HERO: title, description, and the only Submit / Pick buttons
// ============================================================

function CampaignHero({ campaign }: { campaign: Campaign }) {
  const ended = campaign.status === "Ended";

  return (
    <section className="border-b border-white/[0.08]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 lg:pb-16">
        <div className="min-w-0">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Back to campaigns
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-sm font-semibold text-neutral-200">
              {campaign.initial}
            </div>
            <span className="text-sm text-neutral-300">{campaign.brand}</span>
            <span className="text-neutral-700">·</span>
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              {campaign.category}
            </span>
            <StatusPill status={campaign.status} />
          </div>

          <h1
            className={`${ANTON} mt-6 text-[2.75rem] leading-[0.95] tracking-[-0.005em] text-white sm:text-6xl lg:text-[4.5rem]`}
          >
            <span className="relative inline-block">
              {campaign.title}
              <svg
                aria-hidden="true"
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -bottom-3 left-0 h-3 w-3/4 overflow-visible"
                fill="none"
              >
                <path
                  d="M2 9 C 70 3, 170 12, 290 5"
                  stroke={ORANGE}
                  strokeWidth={3}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            {campaign.description}
          </p>

          {campaign.productName && (
            <p className="mt-5 text-sm text-neutral-300">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-600">
                Product{" "}
              </span>
              {campaign.productName}
            </p>
          )}

          {campaign.creatorBrief && (
            <div className="mt-6 max-w-2xl rounded-xl border border-white/[0.08] bg-black p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Creator brief
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                {campaign.creatorBrief}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {ended ? (
              <Link
                href={`/campaign/${campaign.id}/pick`}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
              >
                View Final Results
                <ArrowIcon />
              </Link>
            ) : (
              <>
                <Link
                  href={`/campaign/${campaign.id}/submit`}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
                >
                  Submit a Meme
                  <ArrowIcon />
                </Link>
                <Link
                  href={`/campaign/${campaign.id}/pick`}
                  style={{ borderColor: NEUTRAL_LINE }}
                  className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/[0.04]"
                >
                  Pick the Top 5
                  <ArrowIcon />
                </Link>
              </>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-6 border-t border-white/[0.08] pt-6 sm:grid-cols-3 lg:min-w-[380px] lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
              Prize pool
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums text-white">
              {campaign.prize}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
              Submissions
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums text-white">
              {campaign.submissions}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
              {ended ? "Status" : "Time left"}
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-white">
              {ended ? "Closed" : timeLeftOf(campaign)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

// ============================================================
// LEFT COLUMN
// ============================================================

function CampaignRules({ campaign }: { campaign: Campaign }) {
  const rules = campaign.rules?.length ? campaign.rules : campaignRules;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black p-6 sm:p-7">
      <SectionTitle>Campaign rules</SectionTitle>

      <ol className="mt-5 space-y-3">
        {rules.map((rule, i) => (
          <li
            key={`${i}-${rule}`}
            className="flex items-start gap-3 text-sm text-neutral-300"
          >
            <span
              style={{ borderColor: ORANGE_LINE }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-orange-400"
            >
              {i + 1}
            </span>
            <span className="pt-0.5">{rule}</span>
          </li>
        ))}
      </ol>

      <div className="mt-7 border-t border-white/[0.08] pt-6">
        <h3 className="text-sm font-semibold text-neutral-200">
          How judging works
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          Approved memes enter the judging pool. Everyone gets one pick, and
          rankings stay hidden while the campaign is running. When it ends, the
          Top 5 is revealed and the prize pool is split 50, 25, 15, 7 and 3
          percent across the five memes. Correct early picks earn MemeTaste.
        </p>
      </div>
    </div>
  );
}

type GalleryItem = {
  id: string;
  caption: string;
  mediaUrl: string | null;
  tone?: string;
  postedAgo: string;
};

function SubmissionsPanel({
  campaign,
  approved,
}: {
  campaign: Campaign;
  approved: ApprovedSubmission[];
}) {
  // Database campaigns show real approved rows. Static prototype campaigns
  // keep their existing sample gallery.
  const items: GalleryItem[] = campaign.dynamic
    ? approved.map((a) => ({ ...a, tone: undefined }))
    : getSubmissions(campaign.id).map((s) => ({
        id: String(s.submissionNo),
        caption: s.caption,
        mediaUrl: null,
        tone: s.tone,
        postedAgo: "",
      }));

  const count = campaign.dynamic ? campaign.submissions : items.length;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <SectionTitle>Approved submissions ({count})</SectionTitle>
        {campaign.dynamic && count > 0 && (
          <Link
            href={`/campaign/${campaign.id}/pick`}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            View all
            <ArrowIcon />
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          No approved submissions yet.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950"
            >
              <div
                className={`aspect-[4/3] w-full bg-neutral-900 ${
                  item.tone && !item.mediaUrl
                    ? `bg-gradient-to-br ${item.tone}`
                    : ""
                }`}
              >
                {item.mediaUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.mediaUrl}
                    alt={item.caption}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-3.5">
                <p className="truncate text-sm text-neutral-200">
                  {item.caption}
                </p>
                {item.postedAgo && (
                  <p className="mt-1 text-xs text-neutral-500">
                    {item.postedAgo}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// RIGHT COLUMN
// ============================================================

function CampaignInfo({ campaign }: { campaign: Campaign }) {
  const rows = [
    { label: "Prize pool", value: campaign.prize },
    {
      label: campaign.status === "Ended" ? "Status" : "Time left",
      value: campaign.status === "Ended" ? "Closed" : timeLeftOf(campaign),
    },
    { label: "Submissions", value: String(campaign.submissions) },
    { label: "Judging", value: "Community picks" },
  ];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black p-6">
      <div className="flex items-center justify-between">
        <SectionTitle>Campaign info</SectionTitle>
        <StatusPill status={campaign.status} />
      </div>

      <dl className="mt-5 divide-y divide-white/[0.08]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <dt className="text-sm text-neutral-500">{row.label}</dt>
            <dd className="text-right text-sm font-medium text-neutral-100">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CampaignLeaderboard({ campaign }: { campaign: Campaign }) {
  // Database campaigns: no ranking data yet, so say so rather than invent it.
  const entries = campaign.dynamic ? [] : getLeaderboard(campaign.id);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black p-6">
      <SectionTitle>Campaign leaderboard</SectionTitle>

      {entries.length === 0 ? (
        <p className="mt-5 text-sm text-neutral-500">
          Rankings appear once the community starts picking.
        </p>
      ) : (
        <ol className="mt-5 divide-y divide-white/[0.08]">
          {entries.map((entry) => (
            <li
              key={entry.rank}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    entry.rank === 1
                      ? "bg-orange-500 text-black"
                      : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {entry.rank}
                </span>
                <span className="truncate text-sm text-neutral-100">
                  @{entry.handle}
                </span>
              </div>
              <span className="shrink-0 text-sm font-medium text-neutral-300">
                {entry.votes} votes
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function CampaignDetail({
  campaign,
  approvedSubmissions = [],
}: {
  campaign: Campaign;
  approvedSubmissions?: ApprovedSubmission[];
}) {
  return (
    <main className={`${GEIST} min-h-screen bg-[#080808] text-neutral-100`}>
      <CampaignHero campaign={campaign} />

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_340px] lg:gap-10 lg:py-16">
        <div className="space-y-8 min-w-0">
          <CampaignRules campaign={campaign} />
          <SubmissionsPanel campaign={campaign} approved={approvedSubmissions} />
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <CampaignInfo campaign={campaign} />
          <CampaignLeaderboard campaign={campaign} />
        </aside>
      </section>
    </main>
  );
}