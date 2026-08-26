//! Velum's on-chain shapes.
//!
//! Amounts are `u128`, matching the privacy pool's note amounts rather than ERC-20's `u256`.
//! Nothing Velum stores is a token balance — these are attested figures — so the narrower type is
//! the honest one and keeps a claim's calldata one felt per field.

use starknet::ContractAddress;

/// The pool's deposit shape, mirrored locally.
///
/// Velum returns an empty span of these, so no field is ever serialised — but the shape must match
/// `privacy::objects::OpenNoteDeposit` exactly or a future non-empty return would misdecode.
/// Mirrored rather than imported so this package does not pull in the whole protocol workspace.
#[derive(Copy, Drop, Serde, PartialEq, Debug)]
pub struct OpenNoteDeposit {
    pub note_id: felt252,
    pub token: ContractAddress,
    pub amount: u128,
}

/// One payment a payer asserts it made to a recipient tag.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Attestation {
    pub token: ContractAddress,
    pub amount: u128,
    /// Block timestamp at the moment `attest` ran. The payer does not get to choose it.
    pub attested_at: u64,
}

/// A payer that has bound a human-readable name to its address.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Enrolment {
    pub name: felt252,
    pub enrolled_at: u64,
}

/// What a claim leaves on chain. Note what is absent: no amount, no note, no earner address.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Receipt {
    pub earner_handle: felt252,
    pub payer: ContractAddress,
    pub token: ContractAddress,
    pub from_ts: u64,
    pub to_ts: u64,
    /// The figure that was *proven to be met or exceeded* — not the figure that was earned.
    pub threshold: u128,
    pub challenge_hash: felt252,
    pub expires_at: u64,
    pub issued_at: u64,
    pub spent: bool,
}

/// The answer a verifier gets. Every failure names itself; none of them leak the earner.
#[derive(Copy, Drop, Serde, PartialEq, Debug)]
pub enum ClaimStatus {
    /// No claim with this id.
    Unknown,
    /// The presented preimage does not match the claim's challenge.
    WrongVerifier,
    /// Past `expires_at`.
    Expired,
    /// Already presented once.
    Spent,
    /// Good. The caller may read the claim's fields.
    Valid,
}
