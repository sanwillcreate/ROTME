import { redirect } from "next/navigation";

type BattleRedirectProps = {
  params: Promise<{ campaignId: string }>;
};

// The old pairwise "Meme A vs Meme B" battle mechanic has been replaced by
// the "Pick the Top 5" experience. This keeps any existing /battle/[id]
// links (bookmarks, shared links) working by forwarding them to the new
// route instead of 404ing.
export default async function BattleRedirect({ params }: BattleRedirectProps) {
  const { campaignId } = await params;
  redirect(`/campaign/${campaignId}/pick`);
}