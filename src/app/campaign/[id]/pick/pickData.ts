import { supabase } from "../../../lib/supabase";

export const PICK_COUNT = 12;

export type Submission = {
  id: string;
  submissionNo: number;
  caption: string;
  creator: string;
  creatorId?: string;
  mediaUrl: string;
  rank: number;
  pickCount?: number;
  votes: string;
  tone: string;
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

export async function getPickSubmissions(
  campaignId: string
): Promise<Submission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, submission_no, caption, creator_id, media_url"
    )
    .eq("campaign_id", campaignId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(PICK_COUNT);

  if (error) {
    throw error;
  }

  return (data ?? []).map((submission, index) => ({
  id: submission.id,
  submissionNo: submission.submission_no ?? index + 1,
  caption: submission.caption,
  creator: submission.creator_id.slice(0, 8),
  creatorId: submission.creator_id,
  mediaUrl: submission.media_url,
  votes: "0",
  tone: "",
  rank: index + 1,
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

  const winners: FinalWinner[] = rows.map(
  (submission: FinalTop5Row, index: number) => ({
    id: submission.submission_id,
    submissionNo: submission.submission_no,
    caption: submission.caption,
    creator: submission.creator_id.slice(0, 8),
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

  const creatorIds = winners.map(
    (winner: FinalWinner) => winner.creatorId
  );

  const { data: profiles, error: profilesError } =
    await supabase
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
    walletAddress:
      walletByCreator.get(winner.creatorId) ?? null,
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