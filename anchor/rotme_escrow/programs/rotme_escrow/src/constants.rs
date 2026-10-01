use anchor_lang::prelude::*;

pub const CAMPAIGN_SEED: &[u8] = b"campaign";

pub const SETTLEMENT_SEED: &[u8] = b"settlement";

pub const MAX_CAMPAIGN_ID_LEN: usize = 32;

pub const KEEPER_PUBKEY: Pubkey =
    pubkey!("GGNd93oNR8FhvhbWMB5oghwSjsiMqHooXu1az4ng7akf");