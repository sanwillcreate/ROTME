export type Campaign = {
  id: string;
  brand: string;
  initial: string;
  title: string;
  description: string;
  category: string;
  status: "Active" | "Ending soon" | "Ended";
  prize: string;
  submissions: number;
  remaining: string;
  tone: string;
  productName?: string;
  creatorBrief?: string;
  rules?: string[];
  dynamic?:boolean;
};

export type Submission = {
  id?: string;
  rank: number;
  creator: string;
  submissionNo: number;
  votes: string;
  caption: string;
  tone: string;
  featured?: boolean;
  mediaUrl?: string;
};

export type LeaderboardEntry = {
  rank: number;
  handle: string;
  votes: string;
};

export const campaignData: Record<string, Campaign> = {
  cursor: {
    id: "cursor",
    brand: "Cursor",
    initial: "C",
    title: "Cursor Meme Challenge",
    description:
      "Make something worth sharing. The community decides what deserves to win.",
    category: "Dev tools",
    status: "Ending soon",
    prize: "100 USDC",
    submissions: 342,
    remaining: "31h remaining",
    tone: "from-orange-600/30 to-neutral-900",
  },
  elevenlabs: {
    id: "elevenlabs",
    brand: "ElevenLabs",
    initial: "E",
    title: "ElevenLabs Meme Battle",
    description:
      "AI voices are taking over. Show the internet what that actually sounds like.",
    category: "AI / Audio",
    status: "Active",
    prize: "250 USDC",
    submissions: 821,
    remaining: "4d remaining",
    tone: "from-neutral-700/40 to-neutral-900",
  },
  phantom: {
    id: "phantom",
    brand: "Phantom",
    initial: "P",
    title: "Phantom Meme Wars",
    description:
      "Wallets, gas fees, and the eternal hope of a green candle. Make it funny.",
    category: "Wallets",
    status: "Active",
    prize: "150 USDC",
    submissions: 193,
    remaining: "2d remaining",
    tone: "from-purple-600/25 to-neutral-900",
  },
  vercel: {
    id: "vercel",
    brand: "Vercel",
    initial: "V",
    title: "Vercel Meme Challenge",
    description:
      "Deploy previews, build failures, and the five stages of shipping to prod.",
    category: "Dev tools",
    status: "Active",
    prize: "200 USDC",
    submissions: 456,
    remaining: "3d remaining",
    tone: "from-neutral-600/40 to-neutral-900",
  },
  claude: {
    id: "claude",
    brand: "Claude",
    initial: "C",
    title: "Claude Meme Challenge",
    description:
      "Working with AI, refusing politely, and the occasional existential tangent.",
    category: "AI",
    status: "Active",
    prize: "300 USDC",
    submissions: 678,
    remaining: "5d remaining",
    tone: "from-orange-600/20 to-neutral-900",
  },
  solana: {
    id: "solana",
    brand: "Solana",
    initial: "S",
    title: "Solana Meme Wars",
    description:
      "Fast chains, faster degens. Capture the chaos of on-chain culture.",
    category: "Blockchain",
    status: "Active",
    prize: "500 USDC",
    submissions: 1024,
    remaining: "6d remaining",
    tone: "from-emerald-600/20 to-neutral-900",
  },
};

const captionPool = [
  "when the deploy finally works",
  "me explaining why I need another subscription",
  "POV: production is working",
  "the meeting that could have been an email",
  "when the demo works on the first try",
  "nobody:\nme, refreshing the dashboard",
];

const tonePool = [
  "from-orange-600/30 to-neutral-900",
  "from-neutral-700/40 to-neutral-900",
  "from-neutral-600/30 to-neutral-900",
  "from-orange-500/20 to-neutral-900",
  "from-neutral-800 to-neutral-900",
  "from-neutral-700/30 to-neutral-900",
];

const handlePool = [
  "creatorname",
  "anotheruser",
  "someone",
  "devgirl",
  "basedboy",
  "ratio_queen",
];

export function getSubmissions(campaignId: string, count: number = 6): Submission[] {
  const seed = campaignId.length;
  return Array.from({ length: count }, (_, i) => {
    const votesBase = 900 - i * 140 + seed * 7;
    return {
      rank: i + 1,
      creator: handlePool[(i + seed) % handlePool.length],
      submissionNo: 100 + i * 17 + seed,
      votes: `${votesBase.toLocaleString()}`,
      caption: captionPool[(i + seed) % captionPool.length],
      tone: tonePool[(i + seed) % tonePool.length],
      featured: i === 0,
    };
  });
}

export function getLeaderboard(campaignId: string): LeaderboardEntry[] {
  const seed = campaignId.length;
  return Array.from({ length: 5 }, (_, i) => ({
    rank: i + 1,
    handle: handlePool[(i + seed + 2) % handlePool.length],
    votes: `${(842 - i * 111 + seed * 5).toLocaleString()}`,
  }));
}

export const campaignRules = [
  "Keep it relevant to the brand",
  "Original memes only",
  "No hateful or explicit content",
  "Don't use copyrighted material in a misleading way",
  "Make people laugh",
];