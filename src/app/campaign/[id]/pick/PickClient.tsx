"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { Campaign, type Submission } from "../data";
import {
  getFinalTop5,
  getParticipation,
  getPickSubmissions,
  getExistingPick,
  type FinalWinner,
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
  return (
    <section className="border-b border-white/[0.06]">
      <div className="mx-auto max-w-5xl px-5 pt-8 pb-10 text-center sm:px-8">
        <Link
          href={`/campaign/${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← {campaign.title}
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-sm font-semibold text-neutral-200">
            {campaign.initial}
          </div>

          <span className="text-sm text-neutral-400">{campaign.brand}</span>

          <span className="text-neutral-700">·</span>

          <span className="text-sm text-neutral-400">
            {campaign.prize}
          </span>

          <span className="text-neutral-700">·</span>

          <span className="text-sm text-neutral-400">
            {campaign.remaining}
          </span>

          <StatusBadge status={campaign.status} />
        </div>
<div className="mt-5">
  <SectionLabel>
    {campaign.status === "Ended" ? "Final results" : "Pick the Top 5"}
  </SectionLabel>
</div>

<h1 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight text-neutral-50 sm:text-4xl md:text-[2.75rem]">
  {campaign.status === "Ended"
    ? "The Top 5 is in."
    : "Which meme deserves a spot in the Top 5?"}
</h1>

<p className="mt-4 text-sm font-medium text-neutral-400">
  {campaign.status === "Ended"
    ? "The community has made its picks."
    : `${participation.toLocaleString()} ${
        participation === 1 ? "person has" : "people have"
      } made their pick`}
</p>
      </div>
    </section>
  );
}

// ============================================================
// MEME CARD (picking grid)
// ============================================================

function PickCard({
  submission,
  selected,
  onSelect,
}: {
  submission: Submission;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex flex-col rounded-xl border p-3 text-left transition-all ${
        selected
          ? "border-orange-500/60 bg-orange-500/[0.06]"
          : "border-white/10 bg-neutral-900/40 hover:-translate-y-0.5 hover:border-white/25"
      }`}
    >
      <div
        className={`relative h-24 overflow-hidden rounded-lg border border-white/10 sm:h-28 ${
          submission.mediaUrl ? "bg-neutral-900" : `bg-gradient-to-br ${submission.tone}`
        }`}
      >
        {submission.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={submission.mediaUrl}
            alt={submission.caption}
            className="h-full w-full object-cover"
          />
        )}
        {selected && (
          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
            ✓
          </span>
        )}
      </div>

      <p className="mt-2.5 truncate text-xs text-neutral-300">
        &quot;{submission.caption}&quot;
      </p>

      <p className="mt-1 text-[11px] text-neutral-600">
        @{submission.creator} · #{submission.submissionNo}
      </p>
    </button>
  );
}

// ============================================================
// GRID + PICK FLOW
// ============================================================
function LoginModal({
  campaignId,
  selectedSubmissionNo,
  onClose,
}: {
  campaignId: string;
  selectedSubmissionNo: number;
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
        submissionNo: selectedSubmissionNo,
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

  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const [existingPickId, setExistingPickId] = useState<string | null>(
    null
  );

  const [showLogin, setShowLogin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const selectedSubmission = submissions.find(
    (s) => s.submissionNo === selected
  );

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
          (s) => s.submissionNo === parsed.submissionNo
        );

        if (!submission || !submission.id) return;

        localStorage.removeItem("rotme_pending_pick");

        setSelected(submission.submissionNo);
        await savePick(submission);
      } catch (error) {
        console.error("Failed to restore pending pick:", error);
      }
    };

    if (!loading && submissions.length > 0) {
      handleReturnFromAuth();
    }
  }, [loading, submissions, campaign.id]);

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

        <div className="mt-4 rounded-xl border border-orange-500/40 bg-orange-500/[0.05] p-5">
          <div
            className={`h-40 overflow-hidden rounded-lg border border-white/10 ${
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
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <p className="mt-4 text-sm text-neutral-200">
            &quot;{existingSubmission.caption}&quot;
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            @{existingSubmission.creator} · #
            {existingSubmission.submissionNo}
          </p>
        </div>

        <p className="mt-5 text-sm font-medium text-neutral-300">
          Your pick has been recorded.
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          Rankings stay hidden until {campaign.title} ends — check back
          to see if it made the Top 5.
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
      <div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {submissions.map((s) => (
            <PickCard
              key={s.submissionNo}
              submission={s}
              selected={selected === s.submissionNo}
              onSelect={() =>
                setSelected((cur) =>
                  cur === s.submissionNo
                    ? null
                    : s.submissionNo
                )
              }
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={async () => {
              if (!selectedSubmission || saving) return;

              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (!user) {
                setShowLogin(true);
                return;
              }

              await savePick(selectedSubmission);
            }}
            disabled={selected === null || saving}
            className="rounded-lg bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            {saving ? "Saving..." : "Make My Pick"}
          </button>
        </div>

        {saveError && (
          <p className="mt-3 text-center text-xs text-red-400">
            {saveError}
          </p>
        )}
      </div>

      {showLogin && selected !== null && (
        <LoginModal
          campaignId={campaign.id}
          selectedSubmissionNo={selected}
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
                    @{s.creator} · #{s.submissionNo}
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
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <PickHeader campaign={campaign} participation={participation} />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
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