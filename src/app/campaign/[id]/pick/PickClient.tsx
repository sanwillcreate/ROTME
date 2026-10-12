"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { Campaign } from "../data";
import {
  getFinalTop5,
  getParticipation,
  getPickSubmissions,
  getExistingPick,
  type FinalWinner,
  type Submission,
} from "./pickData";

// ============================================================
// STATIC MOCK PROFILE (prototype — not tied to backend yet)
// ============================================================


const REWARD_TIERS = [
  { threshold: 500, reward: "$2" },
  { threshold: 1000, reward: "$5" },
  { threshold: 2500, reward: "$15" },
  { threshold: 5000, reward: "$35" },
  { threshold: 10000, reward: "$100" },
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

function PickHeader({
  campaign,
  participation,
}: {
  campaign: Campaign;
  participation: number;
}) {
  const ended = campaign.status === "Ended";
  const timeLeft = campaign.remaining.replace(/ remaining$/, "");

  return (
    <section className="border-b border-white/[0.08]">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pb-12">
        <Link
          href={`/campaign/${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Back to campaign
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-sm font-semibold text-neutral-200">
                {campaign.initial}
              </div>
              <span className="text-sm text-neutral-300">{campaign.brand}</span>
              <span className="text-neutral-700">·</span>
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                {campaign.category}
              </span>
              <StatusBadge status={campaign.status} />
            </div>

            <p className="mt-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-orange-500">
              <span aria-hidden="true" className="h-px w-8 bg-orange-500" />
              {ended ? "Final results" : "Pick the Top 5"}
            </p>

            <h1 className="mt-4 font-[family-name:var(--font-anton)] text-[2.6rem] leading-[0.95] text-white sm:text-6xl lg:text-[4rem]">
              {ended ? "The Top 5 is in." : "Which meme deserves a spot in the Top 5?"}
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
              {campaign.description}
            </p>
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
                Participants
              </dt>
              <dd className="mt-2 text-2xl font-semibold tabular-nums text-white">
                {participation.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                {ended ? "Status" : "Time left"}
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-white">
                {ended ? "Closed" : timeLeft}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SHARED HELPERS
// Orange outlines are inline: the global `* { border-color }` rule in
// globals.css would otherwise override border-orange-* utilities.
// ============================================================

const ORANGE_LINE = "rgba(249,115,22,0.35)";
const GEIST = "font-[family-name:var(--font-geist-sans)]";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours >= 1) return `${hours}h ago`;
  return "Just now";
}

// ============================================================
// MEME CARD (picking grid)
// The image opens the viewer. The button picks directly. They are
// separate controls, so nothing is nested inside a button.
// ============================================================

function PickCard({
  submission,
  onOpen,
  onPick,
  disabled,
}: {
  submission: Submission;
  onOpen: () => void;
  onPick: () => void;
  disabled: boolean;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-black transition-colors hover:bg-white/[0.015]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View meme: ${submission.caption}`}
        className="block w-full overflow-hidden bg-neutral-950 text-left"
      >
        <div className="aspect-[4/3] w-full">
          {submission.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={submission.mediaUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${submission.tone}`} />
          )}
        </div>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm leading-snug text-neutral-100">
          {submission.caption}
        </p>

        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-neutral-500">
          <span className="truncate">{submission.creator}</span>
          {submission.postedAt && (
            <span className="shrink-0">{timeAgo(submission.postedAt)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onPick}
          disabled={disabled}
          style={{ borderColor: ORANGE_LINE }}
          className="mt-4 w-full rounded-lg border py-2.5 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pick for Top 5
        </button>
      </div>
    </article>
  );
}

// ============================================================
// MEME VIEWER (full size, centred, dimmed background)
// Shows the whole image or GIF without cropping.
// ============================================================

function MemeViewer({
  items,
  index,
  onClose,
  onPrev,
  onNext,
  onPick,
  disabled,
}: {
  items: Submission[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPick: () => void;
  disabled: boolean;
}) {
  const item = items[index];
  const multiple = items.length > 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && multiple) onPrev();
      if (e.key === "ArrowRight" && multiple) onNext();
    };

    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, onPrev, onNext, multiple]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Meme viewer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-3 py-6 backdrop-blur-sm sm:px-6"
    >
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/[0.1] bg-[#080808] p-4 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-neutral-300 transition-colors hover:text-white sm:right-5 sm:top-5"
        >
          ✕
        </button>

        {multiple && (
          <>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous meme"
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-neutral-200 transition-colors hover:text-white sm:-left-5"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next meme"
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-neutral-200 transition-colors hover:text-white sm:-right-5"
            >
              ›
            </button>
          </>
        )}

        <div className="flex max-h-[62vh] w-full items-center justify-center overflow-hidden rounded-xl bg-black">
          {item.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.mediaUrl}
              alt={item.caption}
              className="max-h-[62vh] w-full object-contain"
            />
          ) : (
            <div className={`h-72 w-full bg-gradient-to-br ${item.tone}`} />
          )}
        </div>

        <div className="mt-5">
          <p className={`${GEIST} text-lg font-semibold leading-snug text-white sm:text-xl`}>
            {item.caption}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
            <span className="text-neutral-300">{item.creator}</span>
            {item.postedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>{timeAgo(item.postedAt)}</span>
              </>
            )}
            {multiple && (
              <span className="ml-auto text-xs">
                {index + 1} of {items.length}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onPick}
          disabled={disabled}
          className="mt-6 w-full rounded-lg bg-orange-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Saving..." : "Pick for Top 5"}
        </button>
      </div>
    </div>
  );
}

function LoginModal({
  campaignId,
  selectedSubmissionId,
  onClose,
}: {
  campaignId: string;
  selectedSubmissionId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Enter your email address.");
      return;
    }

    setSending(true);
    setError(null);

    localStorage.setItem(
      "rotme_pending_pick",
      JSON.stringify({
        campaignId,
        submissionId: selectedSubmissionId,
      })
    );

    const redirectUrl =
      `${window.location.origin}/auth/callback` +
      `?next=/campaign/${campaignId}/pick`;

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Login error:", error);
      setError(error.message);
      setSending(false);
      return;
    }

    setSent(true);
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-neutral-500 transition-colors hover:text-white"
        >
          ✕
        </button>

        {!sent ? (
          <>
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                ROT ME
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Sign in to make your pick
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Your pick is saved to your account so you can build your
                MemeTaste over time.
              </p>
            </div>

            <label className="text-xs font-medium text-neutral-400">
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500/50"
              autoFocus
            />

            {error && (
              <p className="mt-3 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={sending}
              className="mt-5 w-full rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending link..." : "Continue with email"}
            </button>

            <p className="mt-4 text-center text-[11px] text-neutral-600">
              No password required. We'll email you a secure sign-in link.
            </p>
          </>
        ) : (
          <div className="py-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-xl">
              ✉
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-white">
              Check your email
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              We sent a sign-in link to
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-200">
              {email}
            </p>

            <p className="mt-5 text-xs leading-relaxed text-neutral-600">
              Click the link in the email and we'll bring you straight back
              to your pick.
            </p>

            <button
              onClick={onClose}
              className="mt-6 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function PickGrid({ campaign }: { campaign: Campaign }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const [existingPickId, setExistingPickId] = useState<string | null>(
    null
  );

  const [showLogin, setShowLogin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const submissionsData = await getPickSubmissions(campaign.id);
      setSubmissions(submissionsData);

      const existingPick = await getExistingPick(campaign.id);
      setExistingPickId(existingPick);

      setLoading(false);
    };

    loadData();
  }, [campaign.id]);

  const existingSubmission = submissions.find(
    (s) => s.id === existingPickId
  );

  const savePick = async (submission: Submission) => {
    setSaving(true);
    setSaveError(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setShowLogin(true);
      setSaving(false);
      return;
    }

    if (!submission.id) {
      setSaveError("Could not find that submission.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("picks").insert({
      campaign_id: campaign.id,
      submission_id: submission.id,
      user_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        setExistingPickId(submission.id);
        setSaveError(
          "You have already made your pick for this campaign."
        );
      } else {
        console.error("Failed to save pick:", error);
        setSaveError("Something went wrong saving your pick.");
      }

      setSaving(false);
      return;
    }

    setExistingPickId(submission.id);
    setConfirmed(true);
    setSaving(false);
  };

  useEffect(() => {
    const handleReturnFromAuth = async () => {
      const pending = localStorage.getItem("rotme_pending_pick");

      if (!pending) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      try {
        const parsed = JSON.parse(pending);

        if (parsed.campaignId !== campaign.id) return;

        const submission = submissions.find(
          (s) => s.id === parsed.submissionId
        );

        if (!submission || !submission.id) return;

        localStorage.removeItem("rotme_pending_pick");

        setSelected(submission.id);
        await savePick(submission);
      } catch (error) {
        console.error("Failed to restore pending pick:", error);
      }
    };

    if (!loading && submissions.length > 0) {
      handleReturnFromAuth();
    }
  }, [loading, submissions, campaign.id]);

  // Same sign-in and save path as the previous explicit pick button:
  // record the selection, require sign-in, then save. Closes the viewer first.
  const attemptPick = async (submission: Submission) => {
    if (saving) return;

    setViewerIndex(null);
    setSelected(submission.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setShowLogin(true);
      return;
    }

    await savePick(submission);
  };

  const shareText = encodeURIComponent(
    `I think this meme makes the Top 5 of the ${campaign.title} on ROT ME 👀`
  );

  const shareUrl = encodeURIComponent(
    `https://rotme.app/campaign/${campaign.id}`
  );

  const twitterIntent =
    `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-neutral-500">
          Loading memes...
        </p>
      </div>
    );
  }

  if (existingSubmission) {
    return (
      <div className="mx-auto max-w-md text-center">
        <SectionLabel>Your pick</SectionLabel>

        <div
          className="mt-4 rounded-xl border bg-orange-500/[0.04] p-5"
          style={{ borderColor: ORANGE_LINE }}
        >
          <div
            className={`aspect-[4/3] overflow-hidden rounded-lg border border-white/10 ${
              existingSubmission.mediaUrl
                ? "bg-neutral-900"
                : `bg-gradient-to-br ${existingSubmission.tone}`
            }`}
          >
            {existingSubmission.mediaUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={existingSubmission.mediaUrl}
                alt={existingSubmission.caption}
                className="h-full w-full object-contain"
              />
            )}
          </div>

          <p className="mt-4 text-sm text-neutral-200">
            {existingSubmission.caption}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            {existingSubmission.creator}
          </p>
        </div>

        <p className="mt-5 text-sm font-medium text-neutral-300">
          Your pick has been recorded.
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          Rankings stay hidden until {campaign.title} ends. Check back to see
          if it made the Top 5.
        </p>

        <a
          href={twitterIntent}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
        >
          Share your pick on X
        </a>
      </div>
    );
  }

  return (
    <>
      {submissions.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-500">
          No approved memes yet. Check back soon.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((s, i) => (
            <PickCard
              key={s.id}
              submission={s}
              onOpen={() => setViewerIndex(i)}
              onPick={() => attemptPick(s)}
              disabled={saving}
            />
          ))}
        </div>
      )}

      {saveError && (
        <p className="mt-6 text-center text-xs text-red-400">{saveError}</p>
      )}

      {viewerIndex !== null && submissions[viewerIndex] && (
        <MemeViewer
          items={submissions}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onPrev={() =>
            setViewerIndex((cur) =>
              cur === null ? null : (cur - 1 + submissions.length) % submissions.length
            )
          }
          onNext={() =>
            setViewerIndex((cur) =>
              cur === null ? null : (cur + 1) % submissions.length
            )
          }
          onPick={() => attemptPick(submissions[viewerIndex])}
          disabled={saving}
        />
      )}

      {showLogin && selected !== null && (
        <LoginModal
          campaignId={campaign.id}
          selectedSubmissionId={selected}
          onClose={() => setShowLogin(false)}
        />
      )}
    </>
  );
}

// ============================================================
// ENDED CAMPAIGN — TOP 5 REVEAL
// ============================================================

function Top5Reveal({ campaign }: { campaign: Campaign }) {
  const [top5, setTop5] = useState<FinalWinner[]>([]);
  const [loading, setLoading] = useState(true);
  

  

  const prizePoolSol = Number(
    campaign.prize.replace(" SOL", "")
  );

  function getPayoutAmount(percent: number) {
    return (prizePoolSol * percent) / 100;
  }

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);

      try {
        const results = await getFinalTop5(campaign.id);
        setTop5(results);
      } catch (error) {
        console.error("Failed to load final results:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [campaign.id]);

  

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm text-neutral-500">
          Loading final results...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <SectionLabel>Final results</SectionLabel>

      <h2 className="mt-2 text-2xl font-semibold text-neutral-50">
        Top 5 — {campaign.title}
      </h2>

      {top5.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Final results are being prepared.
        </p>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {top5.map((s, i) => (
              <div
                key={s.id ?? s.submissionNo}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-neutral-900/40 p-4"
              >
                <span className="w-6 shrink-0 text-lg font-semibold text-neutral-500">
                  {i + 1}
                </span>

                <div
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 ${
                    s.mediaUrl
                      ? "bg-neutral-900"
                      : `bg-gradient-to-br ${s.tone}`
                  }`}
                >
                  {s.mediaUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.mediaUrl}
                      alt={s.caption}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-neutral-100">
                    &quot;{s.caption}&quot;
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {s.creator}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-white">
                    {getPayoutAmount(
                      s.payoutPercent
                    ).toFixed(4)}{" "}
                    SOL
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    {s.payoutPercent}% of pool
                  </p>

                  <p className="mt-1 text-xs">
                    {s.walletAddress ? (
                      <span className="text-emerald-400">
                        Wallet connected
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        Wallet not connected
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-100">
                  Prize distribution
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {prizePoolSol} SOL will be distributed across the
                  final Top 5.
                </p>
              </div>

              
            </div>

            <p className="mt-3 text-xs text-white/30">
              The campaign creator must approve the transaction
              with the campaign authority wallet.
            </p>

          </div>
        </>
      )}
    </div>
  );
}// ============================================================
// MEMETASTE + REWARDS
// ============================================================
async function getMemeTaste() {
  await supabase.rpc("ensure_my_memetaste_profile");

  const { data, error } = await supabase.rpc(
    "get_my_memetaste"
  );

  if (error) {
    console.error("Failed to fetch MemeTaste:", error);
    return null;
  }

  if (!data || data.length === 0) {
    return {
      total: 0,
      accuracy: 0,
      earlyCalls: 0,
      top5Picks: 0,
      picks: 0,
    };
  }

  const profile = data[0];

  return {
    total: profile.score,
    accuracy:
      profile.total_picks > 0
        ? Math.round(
            (profile.correct_picks / profile.total_picks) * 100
          )
        : 0,
    earlyCalls: profile.early_calls,
    top5Picks: profile.top5_picks,
    picks: profile.total_picks,
  };
}

function MemeTastePanel() {
  const [profile, setProfile] = useState<{
    total: number;
    accuracy: number;
    earlyCalls: number;
    top5Picks: number;
    picks: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const [tiers, setTiers] = useState<
    {
      tier_id: string;
      threshold: number;
      reward_amount: number;
      currency: string;
      unlocked: boolean;
      claimed: boolean;
    }[]
  >([]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const data = await getMemeTaste();

      setProfile(data);

      const { data: rewardData, error } =
        await supabase.rpc("get_my_rewards");

      if (!error) {
        setTiers(rewardData ?? []);
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6">
        <SectionLabel>MemeTaste</SectionLabel>

        <p className="mt-4 text-sm text-neutral-500">
          Loading your MemeTaste...
        </p>
      </div>
    );
  }

  const current = profile ?? {
    total: 0,
    accuracy: 0,
    earlyCalls: 0,
    top5Picks: 0,
    picks: 0,
  };

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6">
      <SectionLabel>MemeTaste</SectionLabel>

      <div className="mt-3 text-4xl font-semibold tracking-tight text-neutral-50">
        {current.total.toLocaleString()}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
        <div>
          <div className="text-lg font-semibold text-neutral-100">
            {current.accuracy}%
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Accuracy
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold text-neutral-100">
            {current.earlyCalls}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Early calls
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold text-neutral-100">
            {current.top5Picks}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Top-5 picks
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold text-neutral-100">
            {current.picks}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Picks
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-white/[0.06] pt-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Rewards
        </div>

        <div className="mt-3 space-y-2">
          {tiers.map((tier) => (
            <div
              key={tier.tier_id}
              className="flex items-center justify-between text-sm"
            >
              <span
                className={
                  tier.unlocked
                    ? "text-neutral-200"
                    : "text-neutral-500"
                }
              >
                {tier.unlocked ? "✓" : "🔒"} $
                {tier.reward_amount}
              </span>

              <span className="text-xs text-neutral-500">
                {tier.claimed
                  ? "claimed"
                  : tier.unlocked
                  ? "unlocked"
                  : `${Math.max(
                      0,
                      tier.threshold - current.total
                    ).toLocaleString()} MemeTaste away`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 border-t border-white/[0.06] pt-5 text-xs leading-relaxed text-neutral-500">
        MemeTaste is your reputation, earned when a meme you
        picked makes the Top 5. Earlier correct picks earn more.
      </p>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function PickClient({ campaign }: { campaign: Campaign }) {
  const [participation, setParticipation] = useState(0);
  const isEnded = campaign.status === "Ended";

  useEffect(() => {
    const loadParticipation = async () => {
      const count = await getParticipation(campaign.id);
      setParticipation(count);
    };

    loadParticipation();
  }, [campaign.id]);

  return (
    <main className={`${GEIST} min-h-screen bg-[#080808] text-neutral-100`}>
      <PickHeader campaign={campaign} participation={participation} />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {isEnded ? (
            <Top5Reveal campaign={campaign} />
          ) : (
            <PickGrid campaign={campaign} />
          )}
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <MemeTastePanel />
        </div>
      </section>
    </main>
  );
}