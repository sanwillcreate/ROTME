use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Campaign {
    pub authority: Pubkey,
    #[max_len(32)]
    pub campaign_id: String,
    pub total_funded: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct CampaignSettlement {
    pub campaign: Pubkey,
    pub total_distributed: u64,
    pub bump: u8,
}