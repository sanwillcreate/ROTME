import Link from "next/link";
import type { Campaign } from "../campaign/[id]/data";

// Orange outlines are inline: the global `* { border-color }` rule in
// globals.css would otherwise override border-orange-* utilities.
const ORANGE_LINE = "rgba(249,115,22,0.35)";
const NEUTRAL_LINE = "rgba(255,255,255,0.14)";

function splitPrize(prize: string) {
  const match = prize.match(/^(.+?)\s+(SOL)$/);
  return match
    ? { amount: match[1], unit: match[2] }
    : { amount: prize, unit: "" };
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

function StatusPill({
  accent,
  children,
}: {
  accent: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{ borderColor: accent ? ORANGE_LINE : NEUTRAL_LINE }}
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        accent ? "text-orange-400" : "bg-white/[0.03] text-neutral-400"
      }`}
    >
      {children}
    </span>
  );
}

export default function CampaignCard({ c }: { c: Campaign }) {
  const ended = c.status === "Ended";
  const endingSoon = c.status === "Ending soon";
  const openEnded = c.remaining === "Open-ended";
  const prize = splitPrize(c.prize);

  return (
    <article className="cc-card flex h-full flex-col rounded-xl border border-white/[0.08] bg-black p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-sm font-semibold text-neutral-200">
            {c.initial}
          </div>
          <span className="truncate text-sm text-neutral-400">{c.brand}</span>
        </div>

        {ended && <StatusPill accent={false}>Ended</StatusPill>}
        {!ended && endingSoon && <StatusPill accent>Ending soon</StatusPill>}
        {!ended && !endingSoon && !openEnded && (
          <StatusPill accent>
            {c.remaining.replace(/ remaining$/, "")} left
          </StatusPill>
        )}
      </header>

      <h3 className="mt-6 text-xl font-semibold leading-snug text-white">
        {c.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-400">
        {c.description}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-5">
        <div className="min-w-0">
          <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
            Prize pool
          </dt>
          <dd className="mt-1.5 truncate text-2xl font-semibold tabular-nums text-white">
            {prize.amount}
            {prize.unit && (
              <span className="ml-1.5 text-sm font-medium text-neutral-400">
                {prize.unit}
              </span>
            )}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
            Submissions
          </dt>
          <dd className="mt-1.5 text-2xl font-semibold tabular-nums text-white">
            {c.submissions}
          </dd>
        </div>
      </dl>

      {openEnded && (
        <p className="mt-4 text-xs text-neutral-500">Open-ended campaign</p>
      )}

      <div className="mt-auto pt-6">
        {ended ? (
          <Link
            href={`/campaign/${c.id}/pick`}
            style={{ borderColor: NEUTRAL_LINE }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/[0.04]"
          >
            View results
            <ArrowIcon />
          </Link>
        ) : (
          <Link
            href={`/campaign/${c.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
          >
            Enter Campaign
            <ArrowIcon />
          </Link>
        )}
      </div>
    </article>
  );
}