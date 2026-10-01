import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

export const ROTME_PROGRAM_ID = new PublicKey(
  "6rSymsCy4egiJSSVx1Zpt5RusP4HZ8BrHhdJkUNAEmRZ"
);

export const DEVNET_RPC = "https://api.devnet.solana.com";

const SYSTEM_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111"
);

const CAMPAIGN_SEED = "campaign";
const SETTLEMENT_SEED = "settlement";

export function getCampaignPda(campaignId: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(CAMPAIGN_SEED), Buffer.from(campaignId)],
    ROTME_PROGRAM_ID
  );

  return pda;
}

export function getSettlementPda(campaignId: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SETTLEMENT_SEED), Buffer.from(campaignId)],
    ROTME_PROGRAM_ID
  );

  return pda;
}

type PhantomProvider = {
  publicKey?: {
    toString(): string;
  } | null;
  isConnected?: boolean;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
};

function getPhantomProvider(): PhantomProvider {
  if (typeof window === "undefined" || !window.solana) {
    throw new Error("Phantom wallet not found.");
  }

  return window.solana as unknown as PhantomProvider;
}

async function getAuthority() {
  const provider = getPhantomProvider();

  if (!provider.publicKey) {
    throw new Error("Connect Phantom before funding a campaign.");
  }

  return {
    provider,
    authority: new PublicKey(provider.publicKey.toString()),
  };
}

async function sendTransactionWithRetry(
  connection: Connection,
  provider: PhantomProvider,
  transaction: Transaction,
  authority: PublicKey,
  maxAttempts = 3
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("finalized");

      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = authority;

      const signedTransaction =
        await provider.signTransaction(transaction);

      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

      return signature;
    } catch (error) {
      lastError = error;

      const message =
        error instanceof Error ? error.message : String(error);

      if (
        !message.toLowerCase().includes("blockhash") ||
        attempt === maxAttempts
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function campaignExists(campaignId: string) {
  const connection = new Connection(DEVNET_RPC, "confirmed");
  const campaignPda = getCampaignPda(campaignId);

  const accountInfo = await connection.getAccountInfo(campaignPda);

  return {
    exists: accountInfo !== null,
    campaignPda,
  };
}

export async function initializeCampaign(campaignId: string) {
  const { provider, authority } = await getAuthority();

  if (!campaignId.trim()) {
    throw new Error("Campaign ID is required.");
  }

  const connection = new Connection(DEVNET_RPC, "confirmed");
  const campaignPda = getCampaignPda(campaignId);

  const existingAccount = await connection.getAccountInfo(campaignPda);

  if (existingAccount) {
    return {
      alreadyInitialized: true,
      signature: null,
      campaignPda: campaignPda.toBase58(),
    };
  }

  /*
   * Anchor instruction discriminator for:
   * initialize_campaign(string)
   *
   * From the deployed ROT ME IDL:
   * [169, 88, 7, 6, 9, 165, 65, 132]
   */
  const initializeDiscriminator = Buffer.from([
    169,
    88,
    7,
    6,
    9,
    165,
    65,
    132,
  ]);

  const campaignIdBytes = Buffer.from(campaignId);

  const data = Buffer.alloc(
    8 + 4 + campaignIdBytes.length
  );

  initializeDiscriminator.copy(data, 0);

  data.writeUInt32LE(
    campaignIdBytes.length,
    8
  );

  campaignIdBytes.copy(data, 12);

  const transaction = new Transaction().add({
    programId: ROTME_PROGRAM_ID,
    keys: [
      {
        pubkey: campaignPda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: authority,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: SYSTEM_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    data,
  });

  const signature = await sendTransactionWithRetry(
    connection,
    provider,
    transaction,
    authority
  );

  return {
    alreadyInitialized: false,
    signature,
    campaignPda: campaignPda.toBase58(),
  };
}

export async function fundCampaign(
  campaignId: string,
  amountSol: number
) {
  const { provider, authority } = await getAuthority();

  if (amountSol <= 0) {
    throw new Error("Funding amount must be greater than zero.");
  }

  const connection = new Connection(DEVNET_RPC, "confirmed");
  const campaignPda = getCampaignPda(campaignId);

  const accountInfo = await connection.getAccountInfo(campaignPda);

  if (!accountInfo) {
    throw new Error(
      "Campaign escrow has not been initialized yet."
    );
  }

  const amountLamports = Math.round(
    amountSol * 1_000_000_000
  );

  if (!Number.isSafeInteger(amountLamports)) {
    throw new Error("Funding amount is too large.");
  }

  /*
   * Anchor instruction discriminator for:
   * fund_campaign(string, u64)
   *
   * From the deployed ROT ME IDL:
   * [109, 57, 56, 239, 99, 111, 221, 121]
   */
  const fundDiscriminator = Buffer.from([
    109,
    57,
    56,
    239,
    99,
    111,
    221,
    121,
  ]);

  const campaignIdBytes = Buffer.from(campaignId);

  const data = Buffer.alloc(
    8 + 4 + campaignIdBytes.length + 8
  );

  fundDiscriminator.copy(data, 0);

  data.writeUInt32LE(
    campaignIdBytes.length,
    8
  );

  campaignIdBytes.copy(data, 12);

  /*
   * Encode u64 little-endian without relying on
   * Buffer.writeBigUInt64LE or BigInt literals.
   *
   * amountLamports is safely within JavaScript's
   * integer range for normal campaign funding amounts.
   */
  let remaining = amountLamports;
  const amountOffset = 12 + campaignIdBytes.length;

  for (let i = 0; i < 8; i++) {
    data[amountOffset + i] = remaining % 256;
    remaining = Math.floor(remaining / 256);
  }

  const transaction = new Transaction().add({
    programId: ROTME_PROGRAM_ID,
    keys: [
      {
        pubkey: campaignPda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: authority,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: SYSTEM_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    data,
  });

  const signature = await sendTransactionWithRetry(
    connection,
    provider,
    transaction,
    authority
  );

  return {
    signature,
    campaignPda: campaignPda.toBase58(),
    amountSol,
  };
}

export async function distributePrizes(
  campaignId: string,
  winnerWallets: string[]
) {
  if (winnerWallets.length !== 5) {
    throw new Error("Exactly 5 winner wallets are required.");
  }

  const { provider, authority } = await getAuthority();

  const connection = new Connection(
    DEVNET_RPC,
    "confirmed"
  );

  const campaignPda = getCampaignPda(campaignId);
  const settlementPda = getSettlementPda(campaignId);

  const winnerKeys = winnerWallets.map((wallet) => {
    try {
      return new PublicKey(wallet);
    } catch {
      throw new Error(
        `Invalid winner wallet address: ${wallet}`
      );
    }
  });

  // Prevent duplicate winner wallets on the client side
  // before we even send the transaction.
  const uniqueWallets = new Set(
    winnerKeys.map((wallet) => wallet.toBase58())
  );

  if (uniqueWallets.size !== 5) {
    throw new Error("Winner wallets must be unique.");
  }

  /*
   * Anchor instruction discriminator for:
   * distribute_prizes(string)
   *
   * SHA-256("global:distribute_prizes")[0..8]
   */
  const distributeDiscriminator = Buffer.from([
    154,
    99,
    201,
    93,
    82,
    104,
    73,
    232,
  ]);

  const campaignIdBytes = Buffer.from(campaignId);

  /*
   * Anchor string encoding:
   *
   * 8 bytes  = instruction discriminator
   * 4 bytes  = string length (u32 LE)
   * N bytes  = campaign ID
   */
  const data = Buffer.alloc(
    8 + 4 + campaignIdBytes.length
  );

  distributeDiscriminator.copy(data, 0);

  data.writeUInt32LE(
    campaignIdBytes.length,
    8
  );

  campaignIdBytes.copy(data, 12);

  const transaction = new Transaction().add({
    programId: ROTME_PROGRAM_ID,
    keys: [
      // Campaign PDA
      {
        pubkey: campaignPda,
        isSigner: false,
        isWritable: true,
      },

      // Settlement PDA
      {
        pubkey: settlementPda,
        isSigner: false,
        isWritable: true,
      },

      // Campaign authority
      {
        pubkey: authority,
        isSigner: true,
        isWritable: true,
      },

      // System program
      {
        pubkey: SYSTEM_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },

      // #1
      {
        pubkey: winnerKeys[0],
        isSigner: false,
        isWritable: true,
      },

      // #2
      {
        pubkey: winnerKeys[1],
        isSigner: false,
        isWritable: true,
      },

      // #3
      {
        pubkey: winnerKeys[2],
        isSigner: false,
        isWritable: true,
      },

      // #4
      {
        pubkey: winnerKeys[3],
        isSigner: false,
        isWritable: true,
      },

      // #5
      {
        pubkey: winnerKeys[4],
        isSigner: false,
        isWritable: true,
      },
    ],
    data,
  });

  const signature = await sendTransactionWithRetry(
    connection,
    provider,
    transaction,
    authority
  );

  return {
    signature,
    campaignPda: campaignPda.toBase58(),
    settlementPda: settlementPda.toBase58(),
    winnerWallets: winnerKeys.map((wallet) =>
      wallet.toBase58()
    ),
  };
}