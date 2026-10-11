import Link from "next/link";
import type { Campaign } from "../campaign/[id]/data";

// Moved from the homepage. Ended campaigns link to their results instead of entry.
export default function CampaignCard({ c }: { c: Campaign }) {
  const ended = c.status === "Ended";

  return (
    <div
      className={`group flex flex-col rounded-xl border border-white/10 bg-neutral-900/40 p-6 transition-colors hover:border-white/20 hover:bg-neutral-900/70 ${
        ended ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-sm font-semibold text-neutral-200">
            {c.initial}
          </div>
          <span className="text-sm text-neutral-400">{c.brand}</span>
        </div>

        {c.status === "Ending soon" && (
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
            Ending soon
          </span>
        )}

        {ended && (
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            Ended
          </span>
        )}
      </div>

      <h3 className="mt-5 text-lg font-semibold leading-snug text-neutral-50">
        {c.title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        {c.description}
      </p>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-neutral-500">
            Prize
          </div>
          <div className="mt-1 text-xl font-semibold text-neutral-50">
            {c.prize}
          </div>
        </div>

        <div className="text-right text-xs text-neutral-500">
          <div>{c.submissions} submissions</div>
          <div className="mt-1">{c.remaining}</div>
        </div>
      </div>

      <Link
        href={ended ? `/campaign/${c.id}/pick` : `/campaign/${c.id}`}
        className="mt-6 w-full rounded-lg border border-white/15 py-2.5 text-center text-sm font-medium text-neutral-200 transition-colors group-hover:border-orange-500/40 group-hover:text-orange-400"
      >
        {ended ? "View results" : "Enter Campaign"}
      </Link>
    </div>
  );
}