"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase";
import { Campaign } from "../data";
import { FileUpload } from "@/components/ui/file-upload";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

type ExistingSubmission = {
  caption: string;
  mediaUrl: string | null;
  status: string;
};

function sanitizeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

// ============================================================
// HEADER
// ============================================================

// Orange and neutral outlines are inline: the global `* { border-color }`
// rule in globals.css overrides border-orange-* utilities.
const NEUTRAL_LINE = "rgba(255,255,255,0.14)";
const ANTON = "font-[family-name:var(--font-anton)]";
const GEIST = "font-[family-name:var(--font-geist-sans)]";

// The route supplies remaining as "3d 4h remaining". Display without suffix.
function timeLeftOf(campaign: Campaign): string {
  return campaign.remaining.replace(/ remaining$/, "");
}

function SubmitHeader({ campaign }: { campaign: Campaign }) {
  const ended = campaign.status === "Ended";

  return (
    <section className="border-b border-white/[0.08]">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pb-12">
        <Link
          href={`/campaign/${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Back to campaign
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
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
            </div>

            <p className="mt-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-orange-500">
              <span aria-hidden="true" className="h-px w-8 bg-orange-500" />
              Submit a meme
            </p>

            <h1
              className={`${ANTON} mt-4 text-[2.5rem] leading-[0.95] text-white sm:text-5xl lg:text-[3.5rem]`}
            >
              {campaign.title}
            </h1>
          </div>

          <dl className="grid grid-cols-2 gap-6 border-t border-white/[0.08] pt-6 lg:min-w-[300px] lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
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
                {ended ? "Status" : "Time left"}
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-white">
                {ended ? "Closed" : timeLeftOf(campaign)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

// ============================================================

function SignInGate({ campaign }: { campaign: Campaign }) {
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

    const redirectUrl =
      `${window.location.origin}/auth/callback` +
      `?next=/campaign/${campaign.id}/submit`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (otpError) {
      console.error("Login error:", otpError);
      setError(otpError.message);
      setSending(false);
      return;
    }

    setSent(true);
    setSending(false);
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-neutral-900/40 p-7 text-center">
      {!sent ? (
        <>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-50">
            Sign in to submit a meme
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Submissions are tied to your account so credit for the meme is
            unambiguous.
          </p>

          <label className="mt-6 block text-left text-xs font-medium text-neutral-400">
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500/50"
            autoFocus
          />

          {error && (
            <p className="mt-3 text-xs text-red-400">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={sending}
            className="mt-5 w-full rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending link..." : "Continue with email"}
          </button>

          <p className="mt-4 text-[11px] text-neutral-600">
            No password required. We&apos;ll email you a secure sign-in link.
          </p>
        </>
      ) : (
        <div className="py-5">
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
            Click the link in the email and we&apos;ll bring you straight
            back here to finish your submission.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ALREADY SUBMITTED STATE
// ============================================================

function AlreadySubmittedState({
  campaign,
  submission,
}: {
  campaign: Campaign;
  submission: ExistingSubmission;
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-neutral-900/30 p-7 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-lg">
        ✓
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight text-neutral-50">
        You&apos;ve already submitted a meme for this campaign.
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-neutral-500">
        Each creator can submit one meme per campaign.
        <br />
        Please participate in other campaigns.
      </p>

      {submission.mediaUrl && (
        <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-neutral-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={submission.mediaUrl}
            alt="Your submitted meme"
            className="max-h-64 w-full object-contain"
          />
        </div>
      )}

      <div className="mt-5 space-y-3 text-left text-sm">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
          <span className="text-neutral-500">Campaign</span>
          <span className="text-right text-neutral-200">
            {campaign.title}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
          <span className="text-neutral-500">Caption</span>
          <span className="max-w-[65%] truncate text-right text-neutral-200">
            &quot;{submission.caption}&quot;
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Status</span>

          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            {submission.status}
          </span>
        </div>
      </div>

      <Link
        href={`/campaign/${campaign.id}`}
        className="mt-7 inline-flex w-full items-center justify-center rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/5"
      >
        Back to campaign
      </Link>
    </div>
  );
}

// ============================================================
// UPLOAD FORM
// ============================================================

// Shows the selected file with replace and remove controls.
// Replace clears the selection, which brings the uploader back.
function MemePreview({
  previewUrl,
  fileName,
  onReplace,
  onRemove,
}: {
  previewUrl: string;
  fileName: string;
  onReplace: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black">
      <div className="flex items-center justify-center bg-neutral-950 p-4 sm:p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Selected meme preview"
          className="max-h-[380px] w-full object-contain"
        />
      </div>

      <div
        style={{ borderTopColor: NEUTRAL_LINE }}
        className="flex items-center justify-between gap-3 border-t px-4 py-3"
      >
        <span className="min-w-0 truncate text-xs text-neutral-400">
          {fileName}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onReplace}
            style={{ borderColor: NEUTRAL_LINE }}
            className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:bg-white/[0.04]"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-red-400"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadForm({
  campaign,
  user,
  onSubmitted,
  onAlreadySubmitted,
}: {
  campaign: Campaign;
  user: User;
  onSubmitted: (caption: string) => void;
  onAlreadySubmitted: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(selected: File | null) {
    setError(null);

    if (!selected) {
      setFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Use a JPG, PNG, GIF, or WebP file.");
      return;
    }

    if (selected.size > MAX_FILE_BYTES) {
      setError("File is too large — 8MB max.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Choose an image or GIF first.");
      return;
    }

    if (!caption.trim()) {
      setError("Give your meme a caption.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const path = `${user.id}/${campaign.id}-${Date.now()}-${sanitizeFileName(
      file.name
    )}`;

    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(path, file, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      setError("Upload failed. Please try again.");
      setSubmitting(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("submissions")
      .getPublicUrl(path);

    const trimmedCaption = caption.trim();

    const { error: insertError } = await supabase
      .from("submissions")
      .insert({
        campaign_id: campaign.id,
        creator_id: user.id,
        media_url: publicUrlData.publicUrl,
        caption: trimmedCaption,
        status: "approved",
      });

    if (insertError) {
      console.error("Failed to save submission:", insertError);

      // PostgreSQL unique violation:
      // one submission per creator per campaign.
      if (insertError.code === "23505") {
        // Clean up the uploaded file because the database insert
        // was rejected and the file is no longer needed.
        await supabase.storage.from("submissions").remove([path]);

        setSubmitting(false);
        onAlreadySubmitted();
        return;
      }

      // Clean up the uploaded file if the database insert failed
      // for another reason as well.
      await supabase.storage.from("submissions").remove([path]);

      setError("Something went wrong saving your submission.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onSubmitted(trimmedCaption);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
          Meme image or GIF
        </p>

        {file && previewUrl ? (
          <MemePreview
            previewUrl={previewUrl}
            fileName={file.name}
            onReplace={() => handleFileChange(null)}
            onRemove={() => handleFileChange(null)}
          />
        ) : (
          // The `dark` class makes the component's dark: variants apply on this
          // light-by-default page. Scoped to this wrapper only.
          <div className="dark overflow-hidden rounded-xl border border-white/[0.08] bg-black">
            <FileUpload
              onChange={(files: File[]) => handleFileChange(files[0] ?? null)}
            />
          </div>
        )}

        <p className="mt-2 text-xs text-neutral-600">
          JPG, PNG, GIF or WebP, up to 8MB.
        </p>
      </div>

      <div>
        <label
          htmlFor="meme-caption"
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500"
        >
          Caption
        </label>

        <input
          id="meme-caption"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="when the deploy finally works"
          style={{ borderColor: NEUTRAL_LINE }}
          className="mt-2 w-full rounded-lg border bg-black px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-shadow focus:ring-1 focus:ring-orange-500/50"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-orange-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
      >
        {submitting ? "Submitting..." : "Submit Meme"}
      </button>
    </form>
  );
}

// ============================================================
// SUCCESS STATE
// ============================================================

function SubmittedState({
  campaign,
  caption,
}: {
  campaign: Campaign;
  caption: string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-7 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-lg text-emerald-400">
        ✓
      </div>

      <h2 className="mt-5 text-lg font-semibold text-neutral-50">
        Your meme has been submitted.
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        Your submission is now part of the campaign.
      </p>

      <div className="mt-5 space-y-3 text-left text-sm">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
          <span className="text-neutral-500">Campaign</span>

          <span className="text-right text-neutral-200">
            {campaign.title}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
          <span className="text-neutral-500">Caption</span>

          <span className="max-w-[65%] truncate text-right text-neutral-200">
            &quot;{caption}&quot;
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Status</span>

          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            Approved
          </span>
        </div>
      </div>

      <Link
        href={`/campaign/${campaign.id}`}
        className="mt-7 inline-flex w-full items-center justify-center rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/5"
      >
        Back to campaign
      </Link>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function SubmitClient({
  campaign,
}: {
  campaign: Campaign;
}) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [checkingSubmission, setCheckingSubmission] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  const [existingSubmission, setExistingSubmission] =
    useState<ExistingSubmission | null>(null);

  const [submittedCaption, setSubmittedCaption] = useState<string | null>(
    null
  );

  async function checkExistingSubmission(currentUser: User) {
    setCheckingSubmission(true);

    const { data, error } = await supabase
      .from("submissions")
      .select("caption, media_url, status")
      .eq("campaign_id", campaign.id)
      .eq("creator_id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to check existing submission:", error);
      setCheckingSubmission(false);
      return;
    }

    if (data) {
      setExistingSubmission({
        caption: data.caption,
        mediaUrl: data.media_url,
        status: data.status,
      });
    } else {
      setExistingSubmission(null);
    }

    setCheckingSubmission(false);
  }

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      const currentUser = data.user ?? null;

      setUser(currentUser);
      setCheckingAuth(false);

      if (currentUser) {
        await checkExistingSubmission(currentUser);
      }
    };

    initialize();

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await checkExistingSubmission(currentUser);
      } else {
        setExistingSubmission(null);
        setCheckingSubmission(false);
      }

      setCheckingAuth(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [campaign.id]);

  return (
    <main className={`${GEIST} min-h-screen bg-[#080808] text-neutral-100`}>
      <SubmitHeader campaign={campaign} />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {checkingAuth ? (
            <p className="text-center text-sm text-neutral-500">
              Checking your session...
            </p>
          ) : !user ? (
            <SignInGate campaign={campaign} />
          ) : checkingSubmission ? (
            <p className="text-center text-sm text-neutral-500">
              Checking your submissions...
            </p>
          ) : existingSubmission ? (
            <AlreadySubmittedState
              campaign={campaign}
              submission={existingSubmission}
            />
          ) : submittedCaption !== null ? (
            <SubmittedState
              campaign={campaign}
              caption={submittedCaption}
            />
          ) : (
            <UploadForm
              campaign={campaign}
              user={user}
              onSubmitted={(caption) => {
                setSubmittedCaption(caption);
                setExistingSubmission({
                  caption,
                  mediaUrl: null,
                  status: "approved",
                });
              }}
              onAlreadySubmitted={async () => {
                await checkExistingSubmission(user);
              }}
            />
          )}
        </div>
      </section>
    </main>
  );
}