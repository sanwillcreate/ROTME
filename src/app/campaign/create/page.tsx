"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useWallet } from "../../lib/wallet";
import {
  campaignExists,
  fundCampaign,
  initializeCampaign,
} from "../../lib/escrow";

const MIN_PRIZE_SOL = 1;

function makeCampaignId(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18);

  const suffix = Math.random().toString(36).slice(2, 6);

  return `${slug || "campaign"}-${suffix}`;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const { publicKey, status } = useWallet();

  const [brandName, setBrandName] = useState("");
  const [productName, setProductName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorBrief, setCreatorBrief] = useState("");
  const [rules, setRules] = useState("");
  const [category, setCategory] = useState("");
  const [prizePool, setPrizePool] = useState("1");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(
    null
  );

  const amount = Number(prizePool);

  const buttonLabel = useMemo(() => {
    if (loading) return "Processing...";
    if (Number.isFinite(amount) && amount >= MIN_PRIZE_SOL) {
      return `Create & Fund Campaign — ${amount} SOL`;
    }
    return "Create & Fund Campaign";
  }, [loading, amount]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (loading) return;

    try {
      setLoading(true);

      if (!publicKey || status !== "connected") {
        throw new Error("Connect Phantom before creating a campaign.");
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sign in to ROT ME before creating a campaign.");
      }

      if (!brandName.trim()) {
        throw new Error("Enter the company or brand name.");
      }

      if (!productName.trim()) {
        throw new Error("Enter the product being launched.");
      }

      if (!title.trim()) {
        throw new Error("Enter a campaign title.");
      }

      if (!description.trim()) {
        throw new Error("Enter a campaign description.");
      }

      if (!creatorBrief.trim()) {
        throw new Error("Tell creators what you want them to make.");
      }

      if (!Number.isFinite(amount) || amount < MIN_PRIZE_SOL) {
        throw new Error("The minimum campaign prize pool is 1 SOL.");
      }

      if (endsAt && startsAt && new Date(endsAt) <= new Date(startsAt)) {
        throw new Error("The campaign end must be after the start.");
      }

      const campaignId = makeCampaignId(title);

      const parsedRules = rules
        .split("\n")
        .map((rule) => rule.trim())
        .filter(Boolean);

      setMessage("Creating your campaign...");

      const { error: insertError } = await supabase.from("campaigns").insert({
        id: campaignId,
        brand_name: brandName.trim(),
        product_name: productName.trim(),
        title: title.trim(),
        description: description.trim(),
        creator_brief: creatorBrief.trim(),
        category: category.trim() || "General",
        rules: parsedRules,
        prize_pool: amount,
        status: "Active",
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setCreatedCampaignId(campaignId);

      setMessage(
        "Campaign created. Preparing your on-chain campaign escrow..."
      );

      const { exists } = await campaignExists(campaignId);

      if (!exists) {
        setMessage(
          "Campaign created. Please approve the escrow initialization in Phantom..."
        );

        await initializeCampaign(campaignId);
      }

      setMessage(
        "Escrow ready. Please approve the funding transaction in Phantom..."
      );

      const result = await fundCampaign(campaignId, amount);

      const explorerUrl = `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`;

      setMessage(
        `Campaign created and funded with ${result.amountSol} SOL.`
      );

      console.log("ROT ME campaign:", campaignId);
      console.log("ROT ME campaign PDA:", result.campaignPda);
      console.log("ROT ME funding transaction:", explorerUrl);

      router.push(`/campaign/${campaignId}`);
    } catch (error) {
      console.error("Create campaign error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the campaign."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
        <a
          href="/"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Back to ROT ME
        </a>

        <div className="mt-10">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500/80">
            Brand campaign
          </span>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-50 sm:text-5xl">
            Create a campaign.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-400">
            Launch your product. Give the internet something to meme about.
            Fund the prize pool and let the community decide what deserves to
            win.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-neutral-900/30 p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Company / Brand"
              value={brandName}
              onChange={setBrandName}
              placeholder="e.g. Cursor"
            />

            <Field
              label="Product being launched"
              value={productName}
              onChange={setProductName}
              placeholder="e.g. Cursor 2.0"
            />
          </div>

          <Field
            label="Campaign title"
            value={title}
            onChange={setTitle}
            placeholder="e.g. Make Cursor the next meme"
          />

          <TextArea
            label="Campaign description"
            value={description}
            onChange={setDescription}
            placeholder="Tell people what this campaign is about."
          />

          <TextArea
            label="What should creators make?"
            value={creatorBrief}
            onChange={setCreatorBrief}
            placeholder="Tell creators what kind of memes you're looking for."
          />

          <TextArea
            label="Campaign rules"
            value={rules}
            onChange={setRules}
            placeholder={"One rule per line\nOriginal content only\nKeep it relevant to the brand"}
          />

          <Field
            label="Category"
            value={category}
            onChange={setCategory}
            placeholder="e.g. AI / Developer tools"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-neutral-200">
                Start date
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                disabled={loading}
                className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-orange-500/50 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-200">
                End date
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                disabled={loading}
                className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-orange-500/50 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-200">
              Prize pool
            </label>

            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min="1"
                step="0.01"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                disabled={loading}
                className="w-40 rounded-lg border border-white/10 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 outline-none focus:border-orange-500/50 disabled:opacity-50"
              />

              <span className="text-sm font-medium text-neutral-400">SOL</span>
            </div>

            <p className="mt-2 text-xs text-neutral-500">
              Minimum campaign prize pool: 1 SOL.
            </p>
          </div>

          <div className="border-t border-white/[0.06] pt-6">
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/[0.04] p-4">
              <p className="text-sm font-medium text-neutral-200">
                Your prize pool will be locked on Solana.
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                After you approve the transaction in Phantom, the SOL will be
                held by the campaign escrow on Devnet.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonLabel}
          </button>

          {message && (
            <div className="rounded-lg border border-white/10 bg-neutral-900 p-4">
              <p className="break-words text-sm text-neutral-300">{message}</p>

              {createdCampaignId && (
                <p className="mt-2 text-xs text-neutral-500">
                  Campaign ID: {createdCampaignId}
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-200">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={false}
        className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-orange-500/50"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-200">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-orange-500/50"
      />
    </div>
  );
}