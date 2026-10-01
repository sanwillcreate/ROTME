import fs from "fs";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const RPC_URL = "https://api.devnet.solana.com";

const PROGRAM_ID = new PublicKey(
  "6rSymsCy4egiJSSVx1Zpt5RusP4HZ8BrHhdJkUNAEmRZ"
);

const connection = new Connection(RPC_URL, "confirmed");

const keypairPath = `${process.env.HOME}/.config/solana/id.json`;

const secretKey = Uint8Array.from(
  JSON.parse(fs.readFileSync(keypairPath, "utf8"))
);

const authority = Keypair.fromSecretKey(secretKey);

const campaignId = "rotme-test-001";

const [campaignPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("campaign"), Buffer.from(campaignId)],
  PROGRAM_ID
);

console.log("Authority:", authority.publicKey.toBase58());
console.log("Campaign ID:", campaignId);
console.log("Campaign PDA:", campaignPda.toBase58());

const balanceBefore = await connection.getBalance(campaignPda);

console.log(
  "Campaign PDA balance before:",
  balanceBefore / 1_000_000_000,
  "SOL"
);

// Anchor discriminator for fund_campaign
const fundDiscriminator = Buffer.from([
  109, 57, 56, 239, 99, 111, 221, 121,
]);

const campaignIdBytes = Buffer.from(campaignId);

// 0.01 SOL
const amount = 10_000_000;

const fundData = Buffer.alloc(8 + 4 + campaignIdBytes.length + 8);

fundDiscriminator.copy(fundData, 0);
fundData.writeUInt32LE(campaignIdBytes.length, 8);
campaignIdBytes.copy(fundData, 12);
fundData.writeBigUInt64LE(BigInt(amount), 12 + campaignIdBytes.length);

const fundInstruction = new TransactionInstruction({
  programId: PROGRAM_ID,
  keys: [
    {
      pubkey: campaignPda,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: authority.publicKey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
  ],
  data: fundData,
});

console.log("\nFunding campaign with 0.01 SOL...");

const transaction = new Transaction().add(fundInstruction);

const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [authority]
);

console.log("Fund transaction:", signature);

console.log(
  `https://explorer.solana.com/tx/${signature}?cluster=devnet`
);

const balanceAfter = await connection.getBalance(campaignPda);

console.log(
  "\nCampaign PDA balance after:",
  balanceAfter / 1_000_000_000,
  "SOL"
);

console.log(
  "Balance increase:",
  (balanceAfter - balanceBefore) / 1_000_000_000,
  "SOL"
);
const accountInfo = await connection.getAccountInfo(campaignPda);

if (!accountInfo) {
  throw new Error("Campaign account not found");
}

// Campaign layout:
// 8 bytes  = Anchor discriminator
// 32 bytes = authority
// 4 bytes  = String length
// N bytes  = campaign_id
// 8 bytes  = total_funded
// 1 byte   = bump

let offset = 8 + 32;

const campaignIdLength = accountInfo.data.readUInt32LE(offset);
offset += 4;

offset += campaignIdLength;

const totalFunded = accountInfo.data.readBigUInt64LE(offset);

console.log(
  "On-chain total_funded:",
  Number(totalFunded) / 1_000_000_000,
  "SOL"
);