import "server-only";

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import { serverSupabase } from "./serverSupabase";

const ROTME_PROGRAM_ID = new PublicKey(
  "6rSymsCy4egiJSSVx1Zpt5RusP4HZ8BrHhdJkUNAEmRZ"
);

const DEVNET_RPC = "https://api.devnet.solana.com";

const CAMPAIGN_SEED = "campaign";
const SETTLEMENT_SEED = "settlement";

const KEEPER_PUBLIC_KEY = new PublicKey(
  "GGNd93oNR8FhvhbWMB5oghwSjsiMqHooXu1az4ng7akf"
);

function getKeeper(): Keypair {
  const raw = process.env.KEEPER_PRIVATE_KEY;

  if (!raw) {
    throw new Error("KEEPER_PRIVATE_KEY is not configured.");
  }

  const secretKey = Uint8Array.from(JSON.parse(raw));
  const keeper = Keypair.fromSecretKey(secretKey);

  if (!keeper.publicKey.equals(KEEPER_PUBLIC_KEY)) {
    throw new Error("Configured keeper key does not match the on-chain keeper.");
  }

  return keeper;
}

function getCampaignPda(campaignId: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(CAMPAIGN_SEED), Buffer.from(campaignId)],
    ROTME_PROGRAM_ID
  );

  return pda;
}

function getSettlementPda(campaignId: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SETTLEMENT_SEED), Buffer.from(campaignId)],
    ROTME_PROGRAM_ID
  );

  return pda;
}

function encodeCampaignId(campaignId: string) {
  const campaignIdBytes = Buffer.from(campaignId);

  const data = Buffer.alloc(8 + 4 + campaignIdBytes.length);

  /*
   * Anchor discriminator for:
   * distribute_prizes_as_keeper(string)
   *
   * SHA-256("global:distribute_prizes_as_keeper")[0..8]
   */
  const discriminator = Buffer.from([
  163,
  70,
  231,
  10,
  211,
  240,
  156,
  253,
]);

  discriminator.copy(data, 0);

  data.writeUInt32LE(campaignIdBytes.length, 8);
  campaignIdBytes.copy(data, 12);

  return data;
}

type Top5Row = {
  submission_id: string;
  submission_no: number;
  creator_id: string;
  pick_count: number;
};

type ProfileRow = {
  id: string;
  wallet_address: string | null;
};

export async function settleCampaign(campaignId: string) {
  if (!campaignId.trim()) {
    throw new Error("Campaign ID is required.");
  }

  if (Buffer.byteLength(campaignId, "utf8") > 32) {
    throw new Error("Campaign ID must be 32 bytes or fewer.");
  }

  const { data: campaign, error: campaignError } =
    await serverSupabase
      .from("campaigns")
      .select("id, ends_at")
      .eq("id", campaignId)
      .single();

  if (campaignError) {
    throw campaignError;
  }

  if (new Date(campaign.ends_at).getTime() > Date.now()) {
    throw new Error("Campaign has not ended yet.");
  }

  const { data: top5, error: top5Error } =
    await serverSupabase.rpc("get_campaign_top5", {
      p_campaign_id: campaignId,
    });

  if (top5Error) {
    throw top5Error;
  }

  const winners = (top5 ?? []) as Top5Row[];

  if (winners.length !== 5) {
    throw new Error(
      `Settlement requires exactly 5 winners. Found ${winners.length}.`
    );
  }

  const creatorIds = winners.map((winner) => winner.creator_id);

  const { data: profiles, error: profilesError } =
    await serverSupabase
      .from("profiles")
      .select("id, wallet_address")
      .in("id", creatorIds);

  if (profilesError) {
    throw profilesError;
  }

  const profileRows = (profiles ?? []) as ProfileRow[];

  const walletByCreator = new Map(
    profileRows.map((profile) => [
      profile.id,
      profile.wallet_address,
    ])
  );

  const winnerWallets = winners.map((winner) => {
    const wallet = walletByCreator.get(winner.creator_id);

    if (!wallet) {
      throw new Error(
        `Winner ${winner.submission_no} does not have a connected wallet.`
      );
    }

    return new PublicKey(wallet);
  });

  const uniqueWallets = new Set(
    winnerWallets.map((wallet) => wallet.toBase58())
  );

  if (uniqueWallets.size !== 5) {
    throw new Error("Winner wallets must be unique.");
  }

  const keeper = getKeeper();

  const connection = new Connection(
    DEVNET_RPC,
    "confirmed"
  );

  const campaignPda = getCampaignPda(campaignId);
  const settlementPda = getSettlementPda(campaignId);

  const existingSettlement =
    await connection.getAccountInfo(settlementPda);

  if (existingSettlement) {
    return {
      alreadySettled: true,
      signature: null,
      settlementPda: settlementPda.toBase58(),
      winnerWallets: winnerWallets.map((wallet) =>
        wallet.toBase58()
      ),
    };
  }

  const data = encodeCampaignId(campaignId);

  const transaction = new Transaction().add({
    programId: ROTME_PROGRAM_ID,
    keys: [
      {
        pubkey: campaignPda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: settlementPda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: keeper.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      ...winnerWallets.map((wallet) => ({
        pubkey: wallet,
        isSigner: false,
        isWritable: true,
      })),
    ],
    data,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = keeper.publicKey;

  transaction.sign(keeper);

  const signature = await connection.sendRawTransaction(
    transaction.serialize()
  );

  await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    "confirmed"
  );

  return {
    alreadySettled: false,
    signature,
    settlementPda: settlementPda.toBase58(),
    winnerWallets: winnerWallets.map((wallet) =>
      wallet.toBase58()
    ),
  };
}
