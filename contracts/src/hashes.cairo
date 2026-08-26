//! Velum's four derivations.
//!
//! Domain tags follow the privacy pool's own template — `<VAR_NAME>:V<VERSION>` as a short string —
//! and every one is prefixed `VELUM_` so no Velum hash can ever collide with a pool hash.
//!
//! Each of these is computed twice: here, and in `lib/velum/hashes.ts`. `tests/test_hashes.cairo`
//! and `lib/velum/hashes.test.ts` assert both agree over the same vectors. A silent divergence
//! between the two is the failure that cannot be debugged from a transaction receipt.

use core::poseidon::poseidon_hash_span;
use starknet::ContractAddress;

/// Domain-separation tags.
pub mod domain_separation {
    /// Tag for `recipient_tag`.
    pub const VELUM_RECIPIENT_TAG: felt252 = 'VELUM_RECIPIENT_TAG:V1';
    /// Tag for `claim_id`.
    pub const VELUM_CLAIM_ID_TAG: felt252 = 'VELUM_CLAIM_ID_TAG:V1';
    /// Tag for `earner_handle`.
    pub const VELUM_EARNER_HANDLE_TAG: felt252 = 'VELUM_EARNER_HANDLE_TAG:V1';
    /// Tag for `params_hash`.
    pub const VELUM_PARAMS_HASH_TAG: felt252 = 'VELUM_PARAMS_HASH_TAG:V1';
    /// Tag for `challenge_hash`.
    pub const VELUM_CHALLENGE_TAG: felt252 = 'VELUM_CHALLENGE_TAG:V1';
}

use domain_separation::*;

pub fn hash(data: Span<felt252>) -> felt252 {
    poseidon_hash_span(data)
}

/// The address a payer attests to.
///
/// Derived from the earner's pool channel key, so the payer can be handed one opaque felt and
/// learns no Starknet address from it. Returns `h(VELUM_RECIPIENT_TAG, channel_key)`.
pub fn compute_recipient_tag(channel_key: felt252) -> felt252 {
    hash([VELUM_RECIPIENT_TAG, channel_key].span())
}

/// The public identifier of one claim.
///
/// `nonce` is a private witness that is never republished, so an observer holding the public claim
/// parameters still cannot recompute a `claim_id`.
/// Returns `h(VELUM_CLAIM_ID_TAG, identity_key, challenge_hash, nonce)`.
pub fn compute_claim_id(identity_key: felt252, challenge_hash: felt252, nonce: felt252) -> felt252 {
    hash([VELUM_CLAIM_ID_TAG, identity_key, challenge_hash, nonce].span())
}

/// The earner's stable pseudonym *within Velum*.
///
/// The pool scopes `identity_key` to the target contract address, so this handle cannot be
/// correlated with the same person's handle at any other dapp.
/// Returns `h(VELUM_EARNER_HANDLE_TAG, identity_key)`.
pub fn compute_earner_handle(identity_key: felt252) -> felt252 {
    hash([VELUM_EARNER_HANDLE_TAG, identity_key].span())
}

/// Binds the private half of a claim to the public half.
///
/// The pool concatenates `privacy_compute`'s result with caller-supplied invoke data and binds
/// them to nothing (`privacy.cairo:571-581`). Without this hash an earner could prove one
/// threshold inside the proof and publish a different one on chain. `privacy_compute` returns it;
/// `privacy_invoke_with_computation` recomputes it from the public half and refuses a mismatch.
pub fn compute_params_hash(
    payer: ContractAddress,
    token: ContractAddress,
    from_ts: u64,
    to_ts: u64,
    threshold: u128,
    challenge_hash: felt252,
    expires_at: u64,
) -> felt252 {
    hash(
        [
            VELUM_PARAMS_HASH_TAG,
            payer.into(),
            token.into(),
            from_ts.into(),
            to_ts.into(),
            threshold.into(),
            challenge_hash,
            expires_at.into(),
        ]
            .span(),
    )
}

/// The commitment a claim is locked to one verifier by.
///
/// The verifier keeps `preimage` and presents it to `verify`. Returns
/// `h(VELUM_CHALLENGE_TAG, preimage)`.
pub fn compute_challenge_hash(preimage: felt252) -> felt252 {
    hash([VELUM_CHALLENGE_TAG, preimage].span())
}
