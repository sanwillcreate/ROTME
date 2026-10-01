"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Campaign } from "./campaign/[id]/data";
import { supabase } from "./lib/supabase";
import WalletButton from "./components/WalletButton";
import ProfileMenu from "./components/ProfileMenu";
// ============================================================
// DATA
// ============================================================

const tickerItems = [
  { user: "alex", action: "entered", target: "Cursor Meme Challenge" },
  { user: "devgirl", action: "submitted a meme", target: "" },
  { user: "basedboy", action: "moved to", target: "#2" },
  { user: "rahul", action: "won", target: "Phantom Meme Wars" },
  { user: "nullptr", action: "entered", target: "ElevenLabs Meme Battle" },
  { user: "ratio_queen", action: "submitted a meme", target: "" },
];



const leaderboard = [
  {
    rank: 1,
    caption: "when Cursor fixes one bug and rewrites your entire app",
    creator: "creatorname",
    score: "8,921",
    trend: "+18%",
    tone: "from-orange-600/30 to-neutral-900",
  },
  {
    rank: 2,
    caption: "me deploying on Friday",
    creator: "anotheruser",
    score: "8,431",
    trend: "+9%",
    tone: "from-neutral-700/40 to-neutral-900",
  },
  {
    rank: 3,
    caption: "POV: production is working",
    creator: "someone",
    score: "7,992",
    trend: "+4%",
    tone: "from-neutral-700/30 to-neutral-900",
  },
];

const topCreators = [
  { rank: 1, handle: "creator", earned: "$1,240", wins: 12 },
  { rank: 2, handle: "creator", earned: "$980", wins: 8 },
  { rank: 3, handle: "creator", earned: "$760", wins: 6 },
];

const howItWorks = [
  {
    n: "01",
    title: "Brands fund",
    body: "Brands create campaigns and fund prize pools.",
  },
  {
    n: "02",
    title: "Creators compete",
    body: "Creators make memes and submit them.",
  },
  {
    n: "03",
    title: "The internet decides",
    body: "The community determines what deserves to win.",
  },
];

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

function SectionHeader({
  label,
  title,
  subtitle,
  align = "left",
}: {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`mb-10 sm:mb-14 ${
        align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl"
      }`}
    >
      {label && (
        <div className="mb-3">
          <SectionLabel>{label}</SectionLabel>
        </div>
      )}

      <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight text-neutral-50 leading-[1.05]">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ============================================================
// NAVBAR
// ============================================================

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 py-4">
        <div className="flex items-center gap-10">
          <span className="text-lg font-bold tracking-tight text-neutral-50">
            ROT<span className="text-orange-500">ME</span>
          </span>

          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a
              href="#campaigns"
              className="hover:text-neutral-100 transition-colors"
            >
              Campaigns
            </a>

            <a
              href="#battle"
              className="hover:text-neutral-100 transition-colors"
            >
              Picks
            </a>

            <a
              href="#leaderboard"
              className="hover:text-neutral-100 transition-colors"
            >
              Leaderboard
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campaign/create"
            className="hidden sm:inline-flex text-sm font-medium text-neutral-300 hover:text-neutral-50 transition-colors px-3 py-2"
          >
            Create Campaign
          </Link>

          <WalletButton />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

// ============================================================
// HERO
// ============================================================

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(255,77,30,0.10), transparent 40%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.05), transparent 35%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-20 sm:pt-28 pb-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            The internet&apos;s meme arena
          </div>

          <h1 className="mt-6 text-[2.6rem] leading-[1.02] sm:text-6xl sm:leading-[1.02] md:text-7xl md:leading-[0.98] font-semibold tracking-tight text-neutral-50">
            Make memes.
            <br />
            Let the internet decide.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-neutral-400 leading-relaxed">
            Brands fund the campaigns. Creators make the memes. The community
            decides what deserves to win.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#campaigns"
              className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
            >
              Explore Campaigns
            </a>

            <a
              href="#battle"
              className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-neutral-200 hover:bg-white/5 transition-colors"
            >
              Make a Pick
            </a>
          </div>

          <div className="mt-12 flex items-center gap-8 text-sm text-neutral-500">
            <div>
              <div className="text-xl font-semibold text-neutral-100">
                $68K+
              </div>
              <div>paid to creators</div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div>
              <div className="text-xl font-semibold text-neutral-100">
                12,400
              </div>
              <div>memes judged</div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div>
              <div className="text-xl font-semibold text-neutral-100">37</div>
              <div>live campaigns</div>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative ml-auto w-full max-w-sm">
            <div className="absolute -top-6 -left-6 w-full rounded-2xl border border-white/10 bg-neutral-900/60 p-4 rotate-[-4deg] shadow-2xl shadow-black/40">
              <div className="h-24 rounded-lg bg-gradient-to-br from-orange-600/25 to-neutral-800" />

              <p className="mt-3 text-xs text-neutral-400">
                &quot;when the deploy finally works&quot;
              </p>

              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
                <span>@devgirl</span>
                <span className="text-orange-500">↑ 22%</span>
              </div>
            </div>

            <div className="relative w-full rounded-2xl border border-white/10 bg-neutral-900/80 p-4 rotate-[3deg] shadow-2xl shadow-black/50">
              <div className="h-28 rounded-lg bg-gradient-to-br from-neutral-700/50 to-neutral-900" />

              <p className="mt-3 text-xs text-neutral-400">
                &quot;POV: production is working&quot;
              </p>

              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
                <span>@someone</span>
                <span className="text-orange-500">↑ 4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// LIVE TICKER
// ============================================================

function LiveTicker() {
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="border-b border-white/[0.06] bg-neutral-950 overflow-hidden">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <div className="flex shrink-0 items-center gap-2 border-r border-white/[0.06] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
          </span>
          Live
        </div>

        <div className="relative flex-1 overflow-hidden py-3">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap pr-10">
            {doubled.map((item, i) => (
              <span key={i} className="text-sm text-neutral-400">
                <span className="text-neutral-200">@{item.user}</span>{" "}
                {item.action}

                {item.target && (
                  <span className="text-neutral-200"> {item.target}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CAMPAIGN CARD
// ============================================================

function CampaignCard({ c }: { c: Campaign }) {
  return (
    <div className="group flex flex-col rounded-xl border border-white/10 bg-neutral-900/40 p-6 transition-colors hover:border-white/20 hover:bg-neutral-900/70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-sm font-semibold text-neutral-200">
            {c.initial}
          </div>

          <span className="text-sm text-neutral-400">
            {c.brand}
          </span>
        </div>

        {c.status === "Ending soon" && (
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
            Ending soon
          </span>
        )}
      </div>

      <h3 className="mt-5 text-lg font-semibold text-neutral-50 leading-snug">
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
        href={`/campaign/${c.id}`}
        className="mt-6 w-full rounded-lg border border-white/15 py-2.5 text-center text-sm font-medium text-neutral-200 transition-colors group-hover:border-orange-500/40 group-hover:text-orange-400"
      >
        Enter Campaign
      </Link>
    </div>
  );
}

function useHomepageCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCampaigns = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("campaigns")
        .select(
          `
            id,
            brand_name,
            title,
            description,
            category,
            prize_pool,
            status,
            ends_at
          `
        )
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch homepage campaigns:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setCampaigns([]);
        setLoading(false);
        return;
      }

      const now = Date.now();

      const dbCampaigns: Campaign[] = (data ?? [])
        .filter((campaign) => {
          if (campaign.status === "Ended") return false;

          if (!campaign.ends_at) return true;

          return new Date(campaign.ends_at).getTime() > now;
        })
        .map((campaign) => {
          const diff = campaign.ends_at
            ? new Date(campaign.ends_at).getTime() - now
            : null;

          let remaining = "—";

          if (diff !== null) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );

            remaining =
              days > 0 ? `${days}d remaining` : `${hours}h remaining`;
          }

          const status: Campaign["status"] =
            campaign.status === "Ending soon" ? "Ending soon" : "Active";

          return {
            id: campaign.id,
            brand: campaign.brand_name,
            initial: campaign.brand_name?.charAt(0).toUpperCase() || "?",
            title: campaign.title,
            description: campaign.description,
            category: campaign.category || "General",
            status,
            prize: `${Number(campaign.prize_pool).toFixed(2)} SOL`,
            submissions: 0,
            remaining,
            tone: "from-orange-600/20 to-neutral-900",
            dynamic: true,
          };
        });

      setCampaigns(dbCampaigns);
      setLoading(false);
    };

    loadCampaigns();

    return () => {
      cancelled = true;
    };
  }, []);

  return { campaigns, loading };
}

function ActiveCampaigns() {
  const { campaigns, loading } = useHomepageCampaigns();

  return (
    <section
      id="campaigns"
      className="border-b border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          label="Active campaigns"
          title="Brands want your worst ideas."
          subtitle="Make them good."
        />

        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-neutral-900/30 p-10 text-center">
            <p className="text-sm text-neutral-500">
              No active campaigns right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// LEADERBOARD
// ============================================================

function LeaderboardRow({ item }: { item: (typeof leaderboard)[number] }) {
  return (
    <div className="grid grid-cols-[2.5rem_4rem_1fr_auto] sm:grid-cols-[3rem_5rem_1fr_auto_auto] items-center gap-4 border-b border-white/[0.06] py-4 last:border-b-0">
      <span className="text-lg font-semibold text-neutral-500">
        {String(item.rank).padStart(2, "0")}
      </span>

      <div
        className={`h-12 w-12 rounded-lg bg-gradient-to-br ${item.tone} border border-white/10`}
      />

      <div className="min-w-0">
        <p className="truncate text-sm sm:text-base text-neutral-100">
          &quot;{item.caption}&quot;
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          @{item.creator}
        </p>
      </div>

      <span className="hidden sm:block text-sm font-medium text-emerald-400">
        {item.trend}
      </span>

      <span className="text-sm font-semibold text-neutral-50">
        {item.score}
      </span>
    </div>
  );
}

function LiveLeaderboard() {
  return (
    <section
      id="leaderboard"
      className="border-b border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          label="What's winning?"
          title="The community has spoken."
        />

        <div className="rounded-xl border border-white/10 bg-neutral-900/30 px-5 sm:px-6">
          {leaderboard.map((item) => (
            <LeaderboardRow key={item.rank} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PICK THE TOP 5
// ============================================================

function PickTheTop5() {
  const { campaigns, loading } = useHomepageCampaigns();

  return (
    <section
      id="battle"
      className="border-b border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          label="Pick the Top 5"
          title="Think you've got meme taste?"
          subtitle="Choose the meme you think will make the Top 5. Build MemeTaste. Earn rewards for being right."
        />

        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-neutral-900/30 p-10 text-center">
            <p className="text-sm text-neutral-500">
              No active campaigns right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <Link
                key={c.id}
                href={`/campaign/${c.id}/pick`}
                className="group flex flex-col rounded-xl border border-white/10 bg-neutral-900/40 p-6 transition-colors hover:border-orange-500/30 hover:bg-neutral-900/70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-sm font-semibold text-neutral-200">
                    {c.initial}
                  </div>
                  <span className="text-sm text-neutral-400">{c.brand}</span>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-neutral-50 leading-snug">
                  {c.title}
                </h3>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                      Prize
                    </div>
                    <div className="mt-1 text-xl font-semibold text-neutral-50">
                      {c.prize}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-neutral-400 transition-colors group-hover:text-orange-400">
                    Make your pick →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// MEMETASTE / REPUTATION
// ============================================================

function MemeTaste() {
  const stats = [
    { label: "Memes judged", value: "1,842" },
    { label: "Correct calls", value: "1,391" },
    { label: "Early discoveries", value: "84" },
    { label: "Campaigns", value: "27" },
  ];

  return (
    <section className="border-b border-white/[0.06] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionLabel>MemeTaste</SectionLabel>

          <h2 className="mt-3 text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight text-neutral-50 leading-[1.05]">
            Good taste is a skill.
          </h2>

          <p className="mt-5 max-w-lg text-lg text-neutral-400 leading-relaxed">
            Anyone can like a meme after it goes viral. ROT ME tracks the
            people who knew it was going to win before everyone else.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-7">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
              MemeTaste score
            </span>

            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
              Elite Curator
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight text-neutral-50">
              87.4
            </span>
          </div>

          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-orange-600 to-orange-400" />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-5">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-xl font-semibold text-neutral-100">
                  {s.value}
                </div>

                <div className="mt-1 text-xs text-neutral-500">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HOW IT WORKS
// ============================================================

function HowItWorks() {
  return (
    <section className="border-b border-white/[0.06] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader align="center" title="How it works" />

        <div className="grid gap-8 sm:grid-cols-3">
          {howItWorks.map((s) => (
            <div key={s.n}>
              <div className="text-sm font-semibold text-orange-500/80">
                {s.n}
              </div>

              <h3 className="mt-3 text-lg font-semibold text-neutral-50">
                {s.title}
              </h3>

              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// TOP CREATORS
// ============================================================

function CreatorLeaderboard() {
  return (
    <section className="border-b border-white/[0.06] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeader align="center" title="Top creators" />

        <div className="rounded-xl border border-white/10 bg-neutral-900/30 divide-y divide-white/[0.06]">
          {topCreators.map((c) => (
            <div
              key={c.rank}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-neutral-500 w-6">
                  #{c.rank}
                </span>

                <span className="text-sm text-neutral-100">
                  @{c.handle}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <span className="text-neutral-300">
                  {c.earned} earned
                </span>

                <span className="text-neutral-500">
                  {c.wins} wins
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FINAL CTA
// ============================================================

function FinalCTA() {
  return (
    <section className="border-b border-white/[0.06] py-24 sm:py-32 text-center">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-50">
          Ready to rot?
        </h2>

        <p className="mt-4 text-lg text-neutral-400">
          Make something stupid. Make it good. Maybe get paid.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#campaigns"
            className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
          >
            Explore Campaigns
          </a>

          <a
            href="#battle"
            className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-neutral-200 hover:bg-white/5 transition-colors"
          >
            Create a Meme
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================

function Footer() {
  return (
    <footer className="py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <span className="text-sm font-bold tracking-tight text-neutral-50">
            ROT<span className="text-orange-500">ME</span>
          </span>

          <p className="mt-1 text-xs text-neutral-500">
            Internet culture, ranked.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">
          <a
            href="#campaigns"
            className="hover:text-neutral-300 transition-colors"
          >
            Campaigns
          </a>

          <a
            href="#battle"
            className="hover:text-neutral-300 transition-colors"
          >
            Picks
          </a>

          <a
            href="#leaderboard"
            className="hover:text-neutral-300 transition-colors"
          >
            Leaderboard
          </a>

          <a href="#" className="hover:text-neutral-300 transition-colors">
            About
          </a>

          <a href="#" className="hover:text-neutral-300 transition-colors">
            Community Rules
          </a>
        </nav>

        <p className="text-xs text-neutral-600">
          Built for the Colosseum hackathon
        </p>
      </div>
    </footer>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <Navbar />
      <Hero />
      <LiveTicker />
      <ActiveCampaigns />
      <LiveLeaderboard />
      <PickTheTop5 />
      <MemeTaste />
      <HowItWorks />
      <CreatorLeaderboard />
      <FinalCTA />
      <Footer />
    </main>
  );
}