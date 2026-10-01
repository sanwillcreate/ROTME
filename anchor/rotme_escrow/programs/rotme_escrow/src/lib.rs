use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("6rSymsCy4egiJSSVx1Zpt5RusP4HZ8BrHhdJkUNAEmRZ");

#[program]
pub mod rotme_escrow {
    use super::*;

    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        campaign_id: String,
    ) -> Result<()> {
        handle_initialize_campaign(ctx, campaign_id)
    }

    pub fn fund_campaign(
        ctx: Context<FundCampaign>,
        campaign_id: String,
        amount: u64,
    ) -> Result<()> {
        handle_fund_campaign(ctx, campaign_id, amount)
    }

    pub fn distribute_prizes<'a>(
        ctx: Context<'a, DistributePrizes<'a>>,
        campaign_id: String,
    ) -> Result<()> {
        handle_distribute_prizes(ctx, campaign_id)
    }

    pub fn distribute_prizes_as_keeper<'a>(
        ctx: Context<'a, DistributePrizesAsKeeper<'a>>,
        campaign_id: String,
    ) -> Result<()> {
        handle_distribute_prizes_as_keeper(ctx, campaign_id)
    }
}