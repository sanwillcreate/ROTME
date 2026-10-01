import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

const PROGRAM_ID = new PublicKey(
  "6rSymsCy4egiJSSVx1Zpt5RusP4HZ8BrHhdJkUNAEmRZ"
);

const AUTHORITY = new PublicKey(
  "icZAYhH2QFtyx44ehNWtZsBkbQven6mEwH91Vid7E55"
);

const SYSTEM_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111"
);

const campaignId = "cursor";

const [campaignPda, bump] =
  PublicKey.findProgramAddressSync(
    [Buffer.from("campaign"), Buffer.from(campaignId)],
    PROGRAM_ID
  );

const discriminator = Buffer.from([
  182, 72, 233, 214, 176, 31, 2, 165,
]);

const campaignIdBytes = Buffer.from(campaignId);

const data = Buffer.alloc(
  8 + 4 + campaignIdBytes.length
);

discriminator.copy(data, 0);

data.writeUInt32LE(
  campaignIdBytes.length,
  8
);

campaignIdBytes.copy(data, 12);

const transaction = new Transaction().add({
  programId: PROGRAM_ID,
  keys: [
    {
      pubkey: campaignPda,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: AUTHORITY,
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

const { blockhash } =
  await connection.getLatestBlockhash("confirmed");

transaction.recentBlockhash = blockhash;
transaction.feePayer = AUTHORITY;

const result =
  await connection.simulateTransaction(transaction);

console.log("Campaign ID:", campaignId);
console.log("PDA:", campaignPda.toBase58());
console.log("Bump:", bump);
console.log("Simulation error:", result.value.err);
console.log("Program logs:");

for (const log of result.value.logs ?? []) {
  console.log(log);
}
