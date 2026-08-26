//! Behaviour of the Velum contract.
//!
//! The cases that matter here are the refusals. A claim that works is one line; a claim that must
//! *not* work — wrong verifier, expired, replayed, forged public half, called by anyone but the
//! pool — is where the product either holds or doesn't.

use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_block_timestamp,
    start_cheat_caller_address, stop_cheat_caller_address,
};
use starknet::ContractAddress;
use velum::hashes::{compute_challenge_hash, compute_params_hash, compute_recipient_tag};
use velum::types::ClaimStatus;
use velum::velum::{IVelumDispatcher, IVelumDispatcherTrait};

const POOL: felt252 = 'POOL';
const PAYER: felt252 = 'PAYER';
const OTHER: felt252 = 'OTHER';
const TOKEN: felt252 = 'TOKEN';
const OTHER_TOKEN: felt252 = 'TOKEN2';

const CHANNEL_KEY: felt252 = 'CHANNEL';
const IDENTITY_KEY: felt252 = 'IDENT';
const NONCE: felt252 = 'NONCE';
const PREIMAGE: felt252 = 'SECRET';

const JAN: u64 = 1767225600; // 2026-01-01
const MAR: u64 = 1774915200; // 2026-03-31
const APR: u64 = 1775000000;
const EXPIRY: u64 = 1790000000;

fn addr(v: felt252) -> ContractAddress {
    v.try_into().unwrap()
}

fn deploy() -> IVelumDispatcher {
    let contract = declare("Velum").unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@array![POOL]).unwrap();
    IVelumDispatcher { contract_address }
}

/// One payer attests `amount` at `at`, as itself.
fn attest_at(velum: IVelumDispatcher, payer: felt252, at: u64, amount: u128, token: felt252) {
    start_cheat_block_timestamp(velum.contract_address, at);
    start_cheat_caller_address(velum.contract_address, addr(payer));
    velum.attest(compute_recipient_tag(CHANNEL_KEY), addr(token), amount);
    stop_cheat_caller_address(velum.contract_address);
}

/// The full claim, as the pool would drive it: compute inside the proof, then invoke on chain.
fn issue_claim(velum: IVelumDispatcher, threshold: u128, expires_at: u64) -> felt252 {
    let challenge_hash = compute_challenge_hash(PREIMAGE);
    let (claim_id, earner_handle, params_hash) = velum
        .privacy_compute(
            IDENTITY_KEY,
            CHANNEL_KEY,
            addr(PAYER),
            addr(TOKEN),
            JAN,
            MAR,
            threshold,
            challenge_hash,
            expires_at,
            NONCE,
        );

    start_cheat_caller_address(velum.contract_address, addr(POOL));
    let (deposits, addresses) = velum
        .privacy_invoke_with_computation(
            claim_id,
            earner_handle,
            params_hash,
            addr(PAYER),
            addr(TOKEN),
            JAN,
            MAR,
            threshold,
            challenge_hash,
            expires_at,
        );
    stop_cheat_caller_address(velum.contract_address);

    // FR-015: no custody. Empty spans are what keeps screening and the app-governor role out of
    // this contract's life entirely.
    assert!(deposits.is_empty());
    assert!(addresses.is_empty());
    claim_id
}

#[test]
fn threshold_met_issues_a_claim() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN + 100, 2_000_000, TOKEN);
    attest_at(velum, PAYER, JAN + 200, 2_500_000, TOKEN);

    start_cheat_block_timestamp(velum.contract_address, APR);
    let claim_id = issue_claim(velum, 4_200_000, EXPIRY);

    assert!(velum.verify(claim_id, PREIMAGE) == ClaimStatus::Valid);
    let receipt = velum.read_claim(claim_id, PREIMAGE);
    // The receipt names the threshold, never the 4,500,000 actually attested.
    assert!(receipt.threshold == 4_200_000);
    assert!(receipt.payer == addr(PAYER));
    assert!(!receipt.spent);
}

#[test]
#[should_panic(expected: 'BELOW_THRESHOLD')]
fn threshold_not_met_panics_inside_the_proof() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN + 100, 1_000_000, TOKEN);
    start_cheat_block_timestamp(velum.contract_address, APR);
    issue_claim(velum, 4_200_000, EXPIRY);
}

#[test]
#[should_panic(expected: 'BELOW_THRESHOLD')]
fn payments_outside_the_window_do_not_count() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN - 1, 5_000_000, TOKEN);
    attest_at(velum, PAYER, MAR, 5_000_000, TOKEN);
    start_cheat_block_timestamp(velum.contract_address, APR);
    issue_claim(velum, 4_200_000, EXPIRY);
}

#[test]
#[should_panic(expected: 'BELOW_THRESHOLD')]
fn another_payers_money_does_not_count() {
    let velum = deploy();
    attest_at(velum, OTHER, JAN + 100, 9_000_000, TOKEN);
    start_cheat_block_timestamp(velum.contract_address, APR);
    issue_claim(velum, 4_200_000, EXPIRY);
}

#[test]
#[should_panic(expected: 'BELOW_THRESHOLD')]
fn another_token_does_not_count() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN + 100, 9_000_000, OTHER_TOKEN);
    start_cheat_block_timestamp(velum.contract_address, APR);
    issue_claim(velum, 4_200_000, EXPIRY);
}

#[test]
fn wrong_verifier_is_refused_by_name() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN + 100, 5_000_000, TOKEN);
    start_cheat_block_timestamp(velum.contract_address, APR);
    let claim_id = issue_claim(velum, 4_200_000, EXPIRY);

    assert!(velum.verify(claim_id, 'WRONG') == ClaimStatus::WrongVerifier);
}

#[test]
fn unknown_claim_is_refused_by_name() {
    let velum = deploy();
    assert!(velum.verify('NOPE', PREIMAGE) == ClaimStatus::Unknown);
}

#[test]
fn expired_claim_is_refused_by_name() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN + 100, 5_000_000, TOKEN);
    start_cheat_block_timestamp(velum.contract_address, APR);
    let claim_id = issue_claim(velum, 4_200_000, APR + 100);

    start_cheat_block_timestamp(velum.contract_address, APR + 100);
    assert!(velum.verify(claim_id, PREIMAGE) == ClaimStatus::Expired);
}

#[test]
fn a_claim_is_single_use() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN + 100, 5_000_000, TOKEN);
    start_cheat_block_timestamp(velum.contract_address, APR);
    let claim_id = issue_claim(velum, 4_200_000, EXPIRY);

    velum.redeem(claim_id, PREIMAGE);
    assert!(velum.verify(claim_id, PREIMAGE) == ClaimStatus::Spent);
}

#[test]
#[should_panic(expected: 'ALREADY_SPENT')]
fn redeeming_twice_reverts() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN + 100, 5_000_000, TOKEN);
    start_cheat_block_timestamp(velum.contract_address, APR);
    let claim_id = issue_claim(velum, 4_200_000, EXPIRY);

    velum.redeem(claim_id, PREIMAGE);
    velum.redeem(claim_id, PREIMAGE);
}

/// The design bug this contract exists to close: the pool does not bind `privacy_compute`'s output
/// to the caller-supplied invoke data, so without `params_hash` an earner proves one threshold and
/// publishes another.
#[test]
#[should_panic(expected: 'PARAMS_MISMATCH')]
fn a_forged_public_half_is_refused() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN + 100, 5_000_000, TOKEN);
    start_cheat_block_timestamp(velum.contract_address, APR);

    let challenge_hash = compute_challenge_hash(PREIMAGE);
    let (claim_id, earner_handle, params_hash) = velum
        .privacy_compute(
            IDENTITY_KEY,
            CHANNEL_KEY,
            addr(PAYER),
            addr(TOKEN),
            JAN,
            MAR,
            4_200_000,
            challenge_hash,
            EXPIRY,
            NONCE,
        );

    start_cheat_caller_address(velum.contract_address, addr(POOL));
    // Proven "at least 4,200,000"; publishing "at least 100,000,000".
    velum
        .privacy_invoke_with_computation(
            claim_id,
            earner_handle,
            params_hash,
            addr(PAYER),
            addr(TOKEN),
            JAN,
            MAR,
            100_000_000,
            challenge_hash,
            EXPIRY,
        );
}

#[test]
#[should_panic(expected: 'UNAUTHORIZED_CALLER')]
fn only_the_pool_may_write_a_receipt() {
    let velum = deploy();
    let challenge_hash = compute_challenge_hash(PREIMAGE);
    let params_hash = compute_params_hash(
        addr(PAYER), addr(TOKEN), JAN, MAR, 4_200_000, challenge_hash, EXPIRY,
    );

    start_cheat_caller_address(velum.contract_address, addr(OTHER));
    velum
        .privacy_invoke_with_computation(
            'FAKE',
            'HANDLE',
            params_hash,
            addr(PAYER),
            addr(TOKEN),
            JAN,
            MAR,
            4_200_000,
            challenge_hash,
            EXPIRY,
        );
}

#[test]
fn anonymity_set_counts_recipients_not_payments() {
    let velum = deploy();
    // The same recipient paid twice on one day is a crowd of one, not two.
    attest_at(velum, PAYER, JAN + 100, 1, TOKEN);
    attest_at(velum, PAYER, JAN + 200, 1, TOKEN);

    start_cheat_block_timestamp(velum.contract_address, APR);
    assert!(velum.anonymity_set(addr(PAYER), JAN, MAR) == 1);
}

#[test]
fn anonymity_set_is_zero_for_a_payer_who_never_paid() {
    let velum = deploy();
    assert!(velum.anonymity_set(addr(OTHER), JAN, MAR) == 0);
}

#[test]
#[should_panic(expected: 'ZERO_AMOUNT')]
fn a_zero_attestation_is_refused() {
    let velum = deploy();
    attest_at(velum, PAYER, JAN + 100, 0, TOKEN);
}

#[test]
fn the_pool_address_is_fixed_at_deploy() {
    let velum = deploy();
    assert!(velum.pool() == addr(POOL));
}
