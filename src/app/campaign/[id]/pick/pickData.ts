import { supabase } from "../../../lib/supabase";

export const PICK_COUNT = 12;

export type Submission = {
  id: string;
  // Internal ordering field. Never rendered: a derived number is not a real one.
  submissionNo: number;
  caption: string;
  // Display name only. Never a raw database identifier.
  creator: string;
  // Internal identifier. Used for lookups, never rendered.
  creatorId?: string;
  mediaUrl: string;
  rank: number;
  pickCount?: number;
  votes: string;
  tone: string;
  // ISO timestamp from submissions.created_at.
  postedAt?: string;
};

export type FinalWinner = Submission & {
  creatorId: string;
  walletAddress: string | null;
  payoutPercent: number;
};

type FinalTop5Row = {
  submission_id: string;
  submission_no: number;
  caption: string;
  creator_id: string;
  media_url: string;
  pick_count: number;
};

type ProfileRow = {
  id: string;
  wallet_address: string | null;
};

const ANONYMOUS_CREATOR = "Anonymous creator";

/*
 * Creator display names come from a read-only view that exposes only
 * id and username. profiles is readable by its owner only, so other
 * creators' names cannot be read from it directly. If the view is missing
 * or unreadable, creators fall back to a neutral label, so no raw database
 * identifier is ever shown.
 */
async function getCreatorNames(
  creatorIds: string[]
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const unique = Array.from(new Set(creatorIds));

  if (unique.length === 0) return names;

  const { data, error } = await supabase
    .from("creator_display_names")
    .select("id, username")
    .in("id", unique);

  if (error) {
    console.warn("Creator display names unavailable:", error.message);
    return names;
  }

  for (const row of (data ?? []) as { id: string; username: string | null }[]) {
    if (row.username) names.set(row.id, row.username);
  }

  return names;
}

export async function getPickSubmissions(
  campaignId: string
): Promise<Submission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("id, submission_no, caption, creator_id, media_url, created_at")
    .eq("campaign_id", campaignId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(PICK_COUNT);

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const names = await getCreatorNames(rows.map((r) => r.creator_id));

  return rows.map((submission, index) => ({
    id: submission.id,
    submissionNo: submission.submission_no ?? index + 1,
    caption: submission.caption,
    creator: names.get(submission.creator_id) ?? ANONYMOUS_CREATOR,
    creatorId: submission.creator_id,
    mediaUrl: submission.media_url,
    votes: "0",
    tone: "",
    rank: index + 1,
    postedAt: submission.created_at,
  }));
}

export async function getParticipation(
  campaignId: string
): Promise<number> {
  const { data, error } = await supabase.rpc(
    "get_campaign_participation",
    {
      p_campaign_id: campaignId,
    }
  );

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export async function getFinalTop5(
  campaignId: string
): Promise<FinalWinner[]> {
  const { data, error } = await supabase.rpc(
    "get_campaign_top5",
    {
      p_campaign_id: campaignId,
    }
  );

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FinalTop5Row[];
  const payoutPercents = [50, 25, 15, 7, 3];

  const names = await getCreatorNames(rows.map((r) => r.creator_id));

  const winners: FinalWinner[] = rows.map(
    (submission: FinalTop5Row, index: number) => ({
      id: submission.submission_id,
      submissionNo: submission.submission_no,
      caption: submission.caption,
      creator: names.get(submission.creator_id) ?? ANONYMOUS_CREATOR,
      creatorId: submission.creator_id,
      mediaUrl: submission.media_url,
      pickCount: Number(submission.pick_count ?? 0),
      rank: index + 1,
      walletAddress: null,
      votes: String(submission.pick_count ?? 0),
      payoutPercent: payoutPercents[index],
      tone: "",
    })
  );

  if (winners.length === 0) {
    return [];
  }

  const creatorIds = winners.map((winner: FinalWinner) => winner.creatorId);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, wallet_address")
    .in("id", creatorIds);

  if (profilesError) {
    throw profilesError;
  }

  const profileRows = (profiles ?? []) as ProfileRow[];

  const walletByCreator = new Map<string, string | null>(
    profileRows.map((profile: ProfileRow) => [
      profile.id,
      profile.wallet_address,
    ])
  );

  return winners.map((winner: FinalWinner) => ({
    ...winner,
    walletAddress: walletByCreator.get(winner.creatorId) ?? null,
  }));
}

export async function getExistingPick(
  campaignId: string
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("picks")
    .select("submission_id")
    .eq("campaign_id", campaignId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.submission_id ?? null;
}