use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

use crate::constants::*;
use crate::error::EscrowError;
use crate::state::Campaign;

#[derive(Accounts)]
#[instruction(campaign_id: String)]
pub struct FundCampaign<'info> {
    #[account(
        mut,
        seeds = [CAMPAIGN_SEED, campaign_id.as_bytes()],
        bump = campaign.bump,
        has_one = authority @ EscrowError::Unauthorized
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Moves native SOL from the signing authority into the campaign's escrow
/// PDA via a System Program CPI transfer, and increases total_funded.
/// `has_one = authority` rejects any signer that isn't the campaign's
/// stored authority; the account constraint rejects a campaign PDA that
/// hasn't been initialized yet (deserialization/seeds check fails).
pub fn handle_fund_campaign(
    ctx: Context<FundCampaign>,
    campaign_id: String,
    amount: u64,
) -> Result<()> {
    require!(amount > 0, EscrowError::InvalidAmount);
    // campaign_id is consumed by the #[instruction(..)] macro above to
    // derive/validate the PDA seeds on the Accounts struct; not otherwise
    // used in this function body.
    let _ = &campaign_id;

    system_program::transfer(
        CpiContext::new(
            system_program::ID,
            Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.campaign.to_account_info(),
            },
        ),
        amount,
    )?;

    let campaign = &mut ctx.accounts.campaign;
    campaign.total_funded = campaign
        .total_funded
        .checked_add(amount)
        .ok_or(EscrowError::CampaignOverflow)?;

    Ok(())
}
