import Link from "next/link";

// Only links to pages that exist. No placeholder or social destinations.
export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <span className="text-sm font-bold tracking-tight text-neutral-50">
            ROT<span className="text-orange-500">ME</span>
          </span>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Internet culture, ranked.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-8 gap-y-3 text-xs text-neutral-500"
        >
          <Link href="/campaigns" className="transition-colors hover:text-neutral-300">
            Campaigns
          </Link>
          <Link href="/#picks" className="transition-colors hover:text-neutral-300">
            Picks
          </Link>
          <Link href="/campaign/create" className="transition-colors hover:text-neutral-300">
            Create a campaign
          </Link>
        </nav>

        <p className="text-xs text-neutral-600">
          Built for the Colosseum hackathon
        </p>
      </div>
    </footer>
  );
}