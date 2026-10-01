use anchor_lang::prelude::*;

#[error_code]
pub enum EscrowError {
    #[msg("Campaign identifier must be between 1 and 32 bytes.")]
    InvalidCampaignId,

    #[msg("Funding amount must be greater than zero.")]
    InvalidAmount,

    #[msg("Only the campaign authority can perform this action.")]
    Unauthorized,

    #[msg("Total funded amount overflowed.")]
    CampaignOverflow,

    #[msg("Campaign has already been settled.")]
    AlreadySettled,

    #[msg("Exactly five winners are required.")]
    InvalidWinnerCount,

    #[msg("Winner must be a valid Solana wallet account.")]
    InvalidWinnerAccount,

    #[msg("Winner wallets must be unique.")]
    DuplicateWinner,

    #[msg("Campaign escrow does not have enough SOL for the prize distribution.")]
    InsufficientFunds,

    #[msg("Prize calculation overflowed.")]
    PayoutOverflow,
}