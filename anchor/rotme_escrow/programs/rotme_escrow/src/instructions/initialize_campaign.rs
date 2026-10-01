use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::EscrowError;
use crate::state::Campaign;

#[derive(Accounts)]
#[instruction(campaign_id: String)]
pub struct InitializeCampaign<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Campaign::INIT_SPACE,
        seeds = [CAMPAIGN_SEED, campaign_id.as_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Creates the campaign's escrow PDA. Whoever signs becomes the campaign's
/// authority — the only wallet allowed to fund it later. The PDA's `init`
/// constraint makes re-initializing the same campaign_id fail outright, so
/// there's no separate "already initialized" flag to track.
pub fn handle_initialize_campaign(
    ctx: Context<InitializeCampaign>,
    campaign_id: String,
) -> Result<()> {
    require!(
        !campaign_id.is_empty() && campaign_id.len() <= MAX_CAMPAIGN_ID_LEN,
        EscrowError::InvalidCampaignId
    );

    let campaign = &mut ctx.accounts.campaign;
    campaign.authority = ctx.accounts.authority.key();
    campaign.campaign_id = campaign_id;
    campaign.total_funded = 0;
    campaign.bump = ctx.bumps.campaign;

    Ok(())
}
