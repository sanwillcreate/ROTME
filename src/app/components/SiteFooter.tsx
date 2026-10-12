
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#080808]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <Link
              href="/"
              aria-label="ROT ME home"
              className="inline-flex text-lg font-extrabold tracking-tight text-white transition-opacity hover:opacity-80"
            >
              ROT<span className="text-orange-500">ME</span>
            </Link>

            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Internet culture, ranked.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Explore
            </p>
            <nav
              aria-label="Footer navigation"
              className="flex flex-col items-start gap-3 text-sm text-neutral-500"
            >
              <Link
                href="/campaigns"
                className="transition-colors hover:text-white"
              >
                Campaigns
              </Link>
              <Link
                href="/#picks"
                className="transition-colors hover:text-white"
              >
                Picks
              </Link>
              <Link
                href="/campaign/create"
                className="transition-colors hover:text-white"
              >
                Create a campaign
              </Link>
            </nav>
          </div>

          {/* Socials */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Made by
            </p>
            <a
              href="https://x.com/wadhwasanchit"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow ROT ME on X"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-orange-500"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 fill-current"
              >
                <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-8.02L5.03 22H1.9l7.25-8.29L1.4 2h6.4l4.43 7.37L18.9 2Zm-1.1 18h1.73L6.86 3.9H5.01L17.8 20Z" />
              </svg>
              <span>@wadhwasanchit</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} ROT ME. All rights reserved.
          </p>
          <p>Made for the internet.</p>
        </div>
      </div>
    </footer>
  );
}
