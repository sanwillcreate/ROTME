"use client";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import Link from "next/link";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "./components/ui/draggable-card";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import Reveal from "./components/Reveal";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// ============================================================
// DATA
// Only factual product rules and clearly-labelled sample content.
// Live campaigns load from Supabase on /campaigns.
// ============================================================

const heroFacts = [
  { value: "Top 5", label: "winners per campaign" },
  { value: "1", label: "pick per person, per campaign" },
  { value: "50 / 25 / 15 / 7 / 3", label: "prize split, percent" },
];

const howItWorksSteps = [
  {
    n: "01",
    title: "Brands launch campaigns",
    body: "A brand sets a SOL prize pool and opens a campaign. The prize is held in an on-chain escrow.",
  },
  {
    n: "02",
    title: "Creators submit memes",
    body: "Creators enter one meme per campaign into the judging pool.",
  },
  {
    n: "03",
    title: "The community picks",
    body: "Everyone chooses the one meme they think will make the Top 5. Rankings stay hidden until the campaign ends.",
  },
  {
    n: "04",
    title: "Results and rewards",
    body: "When a campaign ends, the Top 5 is revealed and the prize is split 50, 25, 15, 7 and 3 percent. Correct early picks build MemeTaste.",
  },
];

const sampleCreators = [
  { rank: 1, handle: "sample_creator_1", wins: 12 },
  { rank: 2, handle: "sample_creator_2", wins: 8 },
  { rank: 3, handle: "sample_creator_3", wins: 6 },
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

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="rise-in inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            The internet&apos;s meme arena
          </div>

          <h1 className="rise-in rise-in-d1 mt-6 text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-neutral-50 sm:text-6xl md:text-7xl md:leading-[0.98]">
            Make memes.
            <br />
            Let the internet decide.
          </h1>

          <p className="rise-in rise-in-d1 mt-6 max-w-lg text-lg leading-relaxed text-neutral-400">
            Brands fund the campaigns. Creators make the memes. The community
            decides what deserves to win.
          </p>

          <div className="rise-in rise-in-d2 mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/campaigns"
              className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
            >
              Explore Campaigns
            </Link>

            <Link
              href="/#picks"
              className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/5"
            >
              Make a Pick
            </Link>
          </div>

          
        </div>

        {/* Draggable meme card stack */}
        <div className="relative hidden h-[460px] translate-x-18 translate-y-10 lg:block">
          <DraggableCardContainer className="relative flex h-full w-full items-center justify-center overflow-visible">
            {/* Back card */}
            <DraggableCardBody className="absolute left-1/2 top-1/2 z-10 w-[290px] -translate-x-1/2 -translate-y-1/2 rotate-[-14deg] bg-neutral-950 p-3">
              <div className="h-[300px] w-full overflow-hidden rounded-sm">
                <img
                  src="/memes/hero-meme-1.png"
                  alt="Meme about a successful deployment"
                  draggable={false}
                  className="pointer-events-none h-full w-full object-cover"
                />
              </div>

              <p className="mt-4 text-center text-lg font-semibold text-neutral-200">
                when the deploy finally works
              </p>
            </DraggableCardBody>

            {/* Middle card */}
            <DraggableCardBody className="absolute left-1/2 top-1/2 z-20 w-[290px] -translate-x-1/2 -translate-y-1/2 rotate-[10deg] bg-neutral-950 p-3">
              <div className="h-[300px] w-full overflow-hidden rounded-sm">
                <img
                  src="/memes/hero-meme-2.png"
                  alt="Meme about a successful deployment"
                  draggable={false}
                  className="pointer-events-none h-full w-full object-cover"
                />
              </div>

              <p className="mt-4 text-center text-lg font-semibold text-neutral-200">
                get me some users
              </p>
            </DraggableCardBody>

            {/* Front card */}
            <DraggableCardBody className="absolute left-1/2 top-1/2 z-30 w-[290px] -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] bg-neutral-950 p-3">
              <div className="h-[300px] w-full overflow-hidden rounded-sm">
                <img
                  src="/memes/hero-meme-3.png"
                  alt="When your code creates a bug"
                  draggable={false}
                  className="pointer-events-none h-full w-full object-cover"
                />
              </div>

              <p className="mt-4 text-center text-lg font-semibold text-neutral-200">
                when your pushed code creates a bug
              </p>
            </DraggableCardBody>
          </DraggableCardContainer>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HOW IT WORKS
// ============================================================

function HowItWorks() {
  const steps = [
    {
      number: "01",
      eyebrow: "FOR COMPANIES",
      title: "Launch a campaign.",
      description:
        "Brands set a brief, launch a meme campaign, and fund the prize pool for the internet's best ideas.",
      tag: "Brands fund the chaos",
    },
    {
      number: "02",
      eyebrow: "FOR CREATORS",
      title: "Make memes. Compete.",
      description:
        "Creators submit memes and GIFs that fit the brief. Every submission gets a shot at making the final Top 5.",
      tag: "Create to win",
    },
    {
      number: "03",
      eyebrow: "FOR THE COMMUNITY",
      title: "Pick the winners.",
      description:
        "The community judges the memes. Pick the one you believe will make the Top 5—without seeing live vote counts.",
      tag: "Your taste matters",
    },
    {
      number: "04",
      eyebrow: "THE TOP 5",
      title: "The best memes get paid.",
      description:
        "When the campaign ends, the five highest-ranked memes split the prize pool: 50%, 25%, 15%, 7%, and 3%.",
      tag: "Creators earn SOL",
    },
    {
      number: "05",
      eyebrow: "MEMETASTE",
      title: "Good taste pays too.",
      description:
        "Community members build MemeTaste by spotting winning memes early. Correct picks can unlock rewards as their score grows.",
      tag: "Predict right. Build reputation.",
    },
  ];

  const [api, setApi] = useState<CarouselApi>();
const [selectedIndex, setSelectedIndex] = useState(0);

const updateSelectedIndex = useCallback(() => {
  if (!api) return;
  setSelectedIndex(api.selectedScrollSnap());
}, [api]);

useEffect(() => {
  if (!api) return;

  updateSelectedIndex();
  api.on("select", updateSelectedIndex);
  api.on("reInit", updateSelectedIndex);

  return () => {
    api.off("select", updateSelectedIndex);
    api.off("reInit", updateSelectedIndex);
  };
}, [api, updateSelectedIndex]);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section className="overflow-hidden border-b border-white/[0.06] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-12 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <SectionLabel>HOW ROT ME WORKS</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight text-neutral-50 sm:text-4xl md:text-[2.75rem]">
              One internet. Five steps. Real rewards.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-400 sm:text-lg">
              Brands bring the brief. Creators bring the memes. The community
              decides who wins and builds MemeTaste along the way.
            </p>
          </div>
        </div>

        <Carousel
        setApi={setApi}
          opts={{ align: "start", loop: true }}
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          className="mx-auto w-full"
        >
          <CarouselContent className="-ml-4">
            {steps.map((step, index) => (
              <CarouselItem
                key={step.number}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="group flex h-full min-h-[330px] flex-col rounded-2xl border border-white/10 bg-neutral-900/50 p-6 transition-colors duration-300 hover:border-orange-500/40 hover:bg-neutral-900 sm:min-h-[350px] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium tracking-widest text-orange-500">
                      STEP {step.number}
                    </span>
                    <span className="text-3xl font-light text-neutral-700 transition-colors group-hover:text-orange-500/70">
                      ↗
                    </span>
                  </div>

                  <div className="mt-10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      {step.eyebrow}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-neutral-50 sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-neutral-400 sm:text-base">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-8">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-300">
                      {step.tag}
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
  <p className="text-xs text-neutral-500">
    {String(selectedIndex + 1).padStart(2, "0")}
    <span className="mx-2 text-neutral-700">/</span>
    {String(steps.length).padStart(2, "0")}
    <span className="ml-3">The ROT ME cycle</span>
  </p>

  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <button
          key={step.number}
          type="button"
          aria-label={`Go to step ${index + 1}`}
          aria-current={selectedIndex === index ? "step" : undefined}
          onClick={() => api?.scrollTo(index)}
          className={`h-2 rounded-full transition-all duration-300 ${
            selectedIndex === index
              ? "w-6 bg-orange-500"
              : "w-2 bg-neutral-700 hover:bg-neutral-500"
          }`}
        />
      ))}
    </div>

    <CarouselPrevious className="static translate-y-0 border-white/15 bg-neutral-900 text-neutral-100 hover:bg-neutral-800" />
    <CarouselNext className="static translate-y-0 border-white/15 bg-neutral-900 text-neutral-100 hover:bg-neutral-800" />
  </div>
</div>
        </Carousel>
      </div>
    </section>
  );
}

// ============================================================
// PICK ENTRY
// Replaces the duplicate campaign grid. Campaigns live on /campaigns.
// ============================================================

function PickEntry() {
  return (
    <section
      id="picks"
      className="border-b border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl">
          <SectionLabel>Pick the Top 5</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight text-neutral-50 sm:text-4xl md:text-[2.75rem]">
            Think you&apos;ve got meme taste?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-400 sm:text-lg">
            Choose the one meme you think will make the Top 5 in any live
            campaign. Build MemeTaste when you&apos;re right.
          </p>
        </div>

        <Link
          href="/campaigns"
          className="inline-flex w-fit rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
        >
          Browse campaigns
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// MEMETASTE — editorial redesign
// Visuals are CSS compositions over existing assets only:
//   /memes/hero-meme-1.png, /memes/hero-meme-2.png, /memes/memetaste-collage.png
// ============================================================

const ANTON = "font-[family-name:var(--font-anton)]";
const GEIST = "font-[family-name:var(--font-geist-sans)]";
const MONO = "font-[family-name:var(--font-geist-mono)]";
const COLLAGE = "/memes/memetaste-collage.png";
const ORANGE = "#f97316"; // orange-500, applied inline (see note in SECTION STYLES)

// Hand-drawn stroke paths. Drawn with non-scaling strokes so line weight
// stays consistent when the box stretches.
const UNDERLINE_D = "M3 9 C 60 3, 150 13, 230 7 S 306 10, 316 6";
const FRAME_D =
  "M6 8 C 30 3, 70 5, 94 6 C 97 30, 96 70, 95 93 C 70 97, 30 95, 5 94 C 3 70, 5 30, 6 8 Z";
const ARROW_D = "M4 30 C 20 16, 40 10, 66 12 M 54 5 L 68 12 L 58 24";
const CROWN_D = "M4 24 L9 6 L18 16 L25 3 L32 16 L41 6 L46 24 Z";
const CIRCLE_D =
  "M8 20 C 6 7, 26 3, 44 5 C 58 8, 60 30, 46 36 C 30 40, 8 34, 8 20";
const ASTERISK_D = "M12 3 L12 21 M4.5 7.5 L19.5 16.5 M19.5 7.5 L4.5 16.5";
const DOT_GRID = {
  backgroundImage:
    "radial-gradient(rgba(0,0,0,0.85) 0.8px, transparent 1.1px)",
  backgroundSize: "4px 4px",
} as const;

// Torn / serrated paper edge for the reward receipt.
const TEETH = 12;
const RECEIPT_CLIP = `polygon(${[
  ...Array.from(
    { length: TEETH + 1 },
    (_, i) =>
      `${((i / TEETH) * 100).toFixed(2)}% ${i % 2 === 0 ? "0%" : "2.5%"}`
  ),
  ...Array.from(
    { length: TEETH + 1 },
    (_, i) =>
      `${(100 - (i / TEETH) * 100).toFixed(2)}% ${i % 2 === 0 ? "100%" : "97.5%"}`
  ),
].join(", ")})`;

function Mark({
  d,
  viewBox,
  className = "",
}: {
  d: string;
  viewBox: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={viewBox}
      preserveAspectRatio="none"
      fill="none"
      className={`pointer-events-none absolute overflow-visible ${className}`}
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function SolMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 18" fill="currentColor" className={className}>
      <path d="M4 0H24L20 4H0Z" />
      <path d="M0 7H20L24 11H4Z" />
      <path d="M4 14H24L20 18H0Z" />
    </svg>
  );
}

// Grayscale, halftone-dotted photo that fills its parent.
function Halftone({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-neutral-800 ${className}`}>
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover grayscale contrast-125"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply"
        style={DOT_GRID}
      />
    </div>
  );
}

// A crop of the existing cat collage, grayscale with halftone grain.
function CollageCrop({
  position,
  className = "",
  style,
}: {
  position: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-800 ${className}`}
      style={style}
    >
      <div
        className="absolute inset-0 grayscale contrast-125"
        style={{
          backgroundImage: `url(${COLLAGE})`,
          backgroundSize: "340% auto",
          backgroundPosition: position,
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
        style={DOT_GRID}
      />
    </div>
  );
}

// ---- Card visuals --------------------------------------------------

function SpotVisual() {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-[4%] top-[12%] w-[44%] -rotate-[8deg] bg-neutral-200 p-1.5 shadow-xl shadow-black/60">
        <Halftone src="/memes/hero-meme-1.png" className="aspect-[4/5] w-full" />
      </div>

      <div className="absolute right-[10%] top-[2%] w-[50%] rotate-[5deg] bg-neutral-100 p-1.5 shadow-2xl shadow-black/70">
        <Halftone src="/memes/hero-meme-2.png" className="aspect-[4/5] w-full" />
      </div>

      <div className="absolute right-[6%] top-[0%] h-[92%] w-[58%] rotate-[3deg]">
        <Mark
          viewBox="0 0 100 100"
          d={FRAME_D}
          className="inset-0 h-full w-full text-orange-500"
        />
      </div>
    </div>
  );
}

function PickVisual() {
  const thumbs = ["6% 8%", "38% 32%", "70% 58%", "98% 18%"];
  const picked = 1;

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2">
      {thumbs.map((pos, i) => (
        <div
          key={pos}
          className={`relative h-24 w-16 shrink-0 transition-transform duration-300 ${
            i === picked ? "z-10 -translate-y-1 scale-110" : "opacity-60"
          }`}
        >
          <CollageCrop
            position={pos}
            style={i === picked ? { borderColor: ORANGE } : undefined}
            className={`h-full w-full rounded-sm border ${
              i === picked ? "" : "border-white/15"
            }`}
          />
        </div>
      ))}

      <Mark
        viewBox="0 0 80 40"
        d={ARROW_D}
        className="left-[24%] top-1 h-8 w-14 rotate-[8deg] text-orange-500"
      />
    </div>
  );
}

function TopFiveVisual() {
  const positions = ["0% 0%", "50% 22%", "100% 45%", "22% 78%", "78% 100%"];

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-2 pb-6">
      {positions.map((pos, i) => (
        <div key={pos} className="relative flex flex-col items-center">
          {i === 0 && (
            <Mark
              viewBox="0 0 50 28"
              d={CROWN_D}
              className="-top-7 left-1/2 h-6 w-9 -translate-x-1/2 text-orange-500"
            />
          )}
          <span
            className={`${MONO} mb-1.5 text-[10px] ${
              i === 0 ? "text-orange-400" : "text-neutral-500"
            }`}
          >
            {i + 1}
          </span>
          <CollageCrop
            position={pos}
            style={i === 0 ? { borderColor: ORANGE } : undefined}
            className={`h-24 w-9 rounded-sm border ${
              i === 0 ? "" : "border-white/15"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function RewardVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative w-40 -rotate-[5deg] bg-[#e9e3d5] px-4 pb-7 pt-4 text-neutral-900 shadow-2xl shadow-black/60"
        style={{ clipPath: RECEIPT_CLIP }}
      >
        <p className={`${MONO} text-[8px] uppercase tracking-[0.22em] text-neutral-600`}>
          ROT ME · Receipt
        </p>
        <p className={`${ANTON} mt-1 text-2xl leading-none`}>REWARD</p>

        <div className="my-2.5 border-t border-dashed border-neutral-500" />

        <SolMark className="h-4 w-6 text-neutral-900" />

        <div className="relative mx-auto mt-2 w-fit px-3">
          <p className={`${ANTON} text-center text-4xl leading-none`}>$2</p>
          <Mark
            viewBox="0 0 60 40"
            d={CIRCLE_D}
            className="-left-1 -top-1 h-[calc(100%+8px)] w-[calc(100%+8px)] text-orange-600"
          />
        </div>

        <p className={`${MONO} mt-1 text-center text-[8px] uppercase tracking-wider text-neutral-600`}>
          worth of SOL
        </p>
      </div>
    </div>
  );
}

// ---- Card shell ----------------------------------------------------

function StepCard({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mt-card group flex flex-col rounded-2xl border border-white/10 bg-neutral-900/60 p-5 sm:p-6">
      <span className={`${MONO} text-[11px] tracking-[0.2em] text-neutral-500`}>
        {number}
      </span>

      <div className="relative mt-4 h-44 overflow-hidden">{children}</div>

      <h3 className={`${GEIST} mt-6 text-lg font-semibold text-neutral-100`}>
        {title}
      </h3>
      <p className={`${GEIST} mt-2 text-sm leading-6 text-neutral-400`}>
        {description}
      </p>
    </article>
  );
}

// ---- Section -------------------------------------------------------

function MemeTaste() {
  const milestones = [
    { score: "200", reward: "$2" },
    { score: "400", reward: "$5" },
    { score: "600", reward: "$8" },
    { score: "800", reward: "$12" },
    { score: "1,000", reward: "$20" },
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06] py-20 sm:py-28">
      {/* SECTION STYLES: scoped to .mt-card; the global `* { border-color }` rule
          overrides border-orange-* utilities, so orange borders here are inline. */}
      <style>{`.mt-card{transition:border-color .3s ease}.mt-card:hover{border-color:rgba(249,115,22,.3)}`}</style>
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* LEFT: the idea + contained collage */}
          <div className="flex flex-col">
            <p
              className={`${MONO} flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-orange-500`}
            >
              <span aria-hidden="true" className="h-px w-8 bg-orange-500" />
              MemeTaste
            </p>

            <h2
              className={`${ANTON} mt-5 text-[2.9rem] leading-[0.92] text-neutral-50 sm:text-6xl lg:text-[4.25rem]`}
            >
              <span className="block">You didn&apos;t just</span>
              <span className="block">like the meme.</span>
              <span className="relative mt-1 block text-orange-500">
                You knew.
                <Mark
                  viewBox="0 0 320 16"
                  d={UNDERLINE_D}
                  className="-bottom-3 left-0 h-4 w-[92%] text-orange-500"
                />
              </span>
            </h2>

            <p
              className={`${GEIST} mt-8 max-w-md text-base leading-7 text-neutral-400 sm:text-lg`}
            >
              Anyone can like a meme once it goes viral. MemeTaste is your
              reputation for spotting the ones that will make the Top 5 before
              everyone else catches on.
            </p>

            <div className="mt-8 flex items-start gap-4 border-t border-white/10 pt-6">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                className="mt-0.5 h-7 w-7 shrink-0 text-orange-500"
              >
                <path d={ASTERISK_D} />
              </svg>
              <div>
                <p className={`${GEIST} text-sm font-medium text-neutral-100`}>
                  Not likes. Not followers.
                </p>
                <p className={`${MONO} mt-1 text-xs text-neutral-500`}>
                  A track record of being right.
                </p>
              </div>
            </div>

            {/* Collage: clipped by its own box, so it cannot spill into the next section */}
            <div
              aria-hidden="true"
              className="relative mt-12 h-44 overflow-hidden sm:h-56 lg:h-72"
            >
              <img
                src={COLLAGE}
                alt=""
                draggable={false}
                className="absolute -bottom-2 left-0 h-[125%] w-auto max-w-none opacity-60 grayscale contrast-125"
                style={{
                  maskImage:
                    "linear-gradient(to top, black 55%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, black 55%, transparent 100%)",
                }}
              />
            </div>
          </div>

          {/* RIGHT: four step cards */}
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <StepCard
              number="01"
              title="Spot the potential"
              description="Find the meme you believe could break into a campaign's Top 5."
            >
              <SpotVisual />
            </StepCard>

            <StepCard
              number="02"
              title="Make your pick"
              description="Back your instinct before the internet agrees. Live vote counts stay hidden."
            >
              <PickVisual />
            </StepCard>

            <StepCard
              number="03"
              title="Prove your taste"
              description="When your pick makes the Top 5, your MemeTaste grows. Correct picks made earlier earn more."
            >
              <TopFiveVisual />
            </StepCard>

            <StepCard
              number="04"
              title="Unlock rewards"
              description="Build your reputation and reach illustrative SOL reward milestones."
            >
              <RewardVisual />
            </StepCard>
          </div>
        </div>

        {/* Concept preview: full width, below both columns */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/50 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className={`${MONO} text-[11px] uppercase tracking-[0.2em] text-orange-500`}
              >
                Concept preview
              </p>
              <h3
                className={`${ANTON} mt-3 text-3xl leading-none text-neutral-50 sm:text-4xl`}
              >
                A little taste of what&apos;s possible.
              </h3>
            </div>

            <span
              className={`${MONO} w-fit rounded-full border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-wider text-neutral-400`}
            >
              Illustrative only
            </span>
          </div>

          <div className="relative mt-10">
            <div
              aria-hidden="true"
              style={{ borderTopColor: "rgba(249,115,22,0.4)" }}
              className="absolute left-0 right-0 top-[9px] border-t border-dashed"
            />

            <ol className="relative grid grid-cols-5 gap-2 sm:gap-4">
              {milestones.map((m) => (
                <li key={m.score} className="min-w-0">
                  <span
                    aria-hidden="true"
                    style={{ borderColor: ORANGE }}
                    className="mx-auto block h-[18px] w-[18px] rounded-full border-2 bg-neutral-950"
                  />

                  <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/30 px-2 py-4 text-center">
                    <p className={`${MONO} text-[10px] text-neutral-500 sm:text-xs`}>
                      {m.score}
                    </p>
                    <p
                      className={`${MONO} mt-0.5 hidden text-[10px] uppercase tracking-wider text-neutral-600 sm:block`}
                    >
                      MemeTaste
                    </p>
                    <p
                      className={`${ANTON} mt-2 text-xl leading-none text-orange-500 sm:text-3xl`}
                    >
                      {m.reward}
                    </p>
                    <p className={`${MONO} mt-1 text-[9px] text-neutral-500 sm:text-[10px]`}>
                      worth of SOL
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className={`${GEIST} mt-8 text-xs leading-5 text-neutral-500`}>
            Proposed milestones only. Reward values and eligibility rules are
            illustrative; rewards are not currently claimable.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CREATOR PREVIEW
// Sample rows only. No real creator data is shown here.
// ============================================================

function CreatorPreview() {
  return (
    <section className="border-b border-white/[0.06] py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div>
          <SectionLabel>Top creators</SectionLabel>

          <h2 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight text-neutral-50 sm:text-4xl">
            Creators build a record.
          </h2>

          <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-400">
            Every Top 5 placement adds to a creator&apos;s record across
            campaigns.
          </p>

          <p className="mt-4 text-xs text-neutral-600">
            Sample data. Live creator rankings appear once campaigns have
            results.
          </p>
        </div>

        <ol className="divide-y divide-white/[0.06] rounded-xl border border-white/10 bg-neutral-900/30">
          {sampleCreators.map((c) => (
            <li
              key={c.rank}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <span className="w-6 text-sm font-semibold text-neutral-500">
                  {c.rank}
                </span>
                <span className="text-sm text-neutral-100">@{c.handle}</span>
              </div>

              <span className="text-sm text-neutral-400">
                {c.wins} Top 5 wins
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ============================================================
// FINAL CTA
// ============================================================

function FinalCTA() {
  return (
    <section className="border-b border-white/[0.06] py-24 text-center sm:py-32">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <h2 className="text-4xl font-semibold tracking-tight text-neutral-50 sm:text-5xl">
          Ready to rot?
        </h2>

        <p className="mt-4 text-lg text-neutral-400">
          Make something stupid. Make it good. Maybe get paid.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/campaigns"
            className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
          >
            Explore campaigns
          </Link>

          <Link
            href="/campaign/create"
            className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/5"
          >
            Launch a campaign
          </Link>
        </div>
      </div>
    </section>
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
      <HowItWorks />
      <PickEntry />
      <MemeTaste />
      <CreatorPreview />
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}