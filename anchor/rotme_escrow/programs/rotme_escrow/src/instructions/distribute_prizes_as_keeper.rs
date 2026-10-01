use anchor_lang::prelude::*;

use crate::{
    constants::{CAMPAIGN_SEED, KEEPER_PUBKEY, SETTLEMENT_SEED},
    error::EscrowError,
    state::{Campaign, CampaignSettlement},
};

#[derive(Accounts)]
#[instruction(campaign_id: String)]
pub struct DistributePrizesAsKeeper<'info> {
    #[account(
        mut,
        seeds = [CAMPAIGN_SEED, campaign_id.as_bytes()],
        bump = campaign.bump,
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = keeper,
        space = 8 + CampaignSettlement::INIT_SPACE,
        seeds = [SETTLEMENT_SEED, campaign_id.as_bytes()],
        bump,
    )]
    pub settlement: Account<'info, CampaignSettlement>,

    #[account(
        mut,
        address = KEEPER_PUBKEY @ EscrowError::Unauthorized,
    )]
    pub keeper: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_distribute_prizes_as_keeper<'a>(
    ctx: Context<'a, DistributePrizesAsKeeper<'a>>,
    campaign_id: String,
) -> Result<()> {
    let winners = &ctx.remaining_accounts;

    require!(
        winners.len() == 5,
        EscrowError::InvalidWinnerCount
    );

    // Make sure every winner wallet is unique.
    for i in 0..winners.len() {
        for j in (i + 1)..winners.len() {
            require!(
                winners[i].key() != winners[j].key(),
                EscrowError::DuplicateWinner
            );
        }
    }

    // Winner accounts must be normal Solana system accounts.
    for winner in winners.iter() {
        require!(
            winner.owner == &system_program::ID,
            EscrowError::InvalidWinnerAccount
        );

        require!(
            !winner.executable,
            EscrowError::InvalidWinnerAccount
        );
    }

    let total = ctx.accounts.campaign.total_funded;

    // 50%, 25%, 15%, 7%.
    //
    // The final winner receives the remainder so that the
    // entire funded amount is distributed exactly, avoiding
    // rounding dust.
    let first = total
        .checked_mul(50)
        .and_then(|value| value.checked_div(100))
        .ok_or(EscrowError::PayoutOverflow)?;

    let second = total
        .checked_mul(25)
        .and_then(|value| value.checked_div(100))
        .ok_or(EscrowError::PayoutOverflow)?;

    let third = total
        .checked_mul(15)
        .and_then(|value| value.checked_div(100))
        .ok_or(EscrowError::PayoutOverflow)?;

    let fourth = total
        .checked_mul(7)
        .and_then(|value| value.checked_div(100))
        .ok_or(EscrowError::PayoutOverflow)?;

    let fifth = total
        .checked_sub(first)
        .and_then(|value| value.checked_sub(second))
        .and_then(|value| value.checked_sub(third))
        .and_then(|value| value.checked_sub(fourth))
        .ok_or(EscrowError::PayoutOverflow)?;

    let payouts = [first, second, third, fourth, fifth];

    // Keep the Campaign PDA rent-exempt.
    let campaign_info = ctx.accounts.campaign.to_account_info();
    let rent_minimum = Rent::get()?.minimum_balance(campaign_info.data_len());

    let available = campaign_info
        .lamports()
        .checked_sub(rent_minimum)
        .ok_or(EscrowError::InsufficientFunds)?;

    require!(
        available >= total,
        EscrowError::InsufficientFunds
    );

    for (winner, amount) in winners.iter().zip(payouts.iter()) {
        {
            let mut campaign_lamports =
                campaign_info.try_borrow_mut_lamports()?;

            **campaign_lamports = (**campaign_lamports)
                .checked_sub(*amount)
                .ok_or(EscrowError::InsufficientFunds)?;
        }

        {
            let mut winner_lamports =
                winner.try_borrow_mut_lamports()?;

            **winner_lamports = (**winner_lamports)
                .checked_add(*amount)
                .ok_or(EscrowError::PayoutOverflow)?;
        }
    }

    // Create the settlement receipt.
    ctx.accounts.settlement.campaign = campaign_info.key();
    ctx.accounts.settlement.total_distributed = total;
    ctx.accounts.settlement.bump = ctx.bumps.settlement;

    Ok(())
}
