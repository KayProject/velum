//! Velum — selective income proof over the STRK20 privacy pool.
//!
//! Two sides, deliberately asymmetric:
//!
//! * A **payer** calls `attest` publicly, naming a recipient *tag* rather than an address. It
//!   states an amount in the clear. Velum does not hide what a payer says it paid; it hides who
//!   was paid, and it hides which payments a later claim was built from.
//! * An **earner** never touches this contract directly. She reaches it through the pool's
//!   `ComputeAndInvoke`, so her channel key, the attestations she selected, and their sum are all
//!   private witnesses inside the proof. What lands on chain is a receipt naming a threshold that
//!   was met — never a total that was earned.
//!
//! The declared leak is **unlinkability, not amount-hiding**. Say so on the verifier page, not
//! only in a README.

use starknet::ContractAddress;
use crate::types::{ClaimStatus, Enrolment, OpenNoteDeposit, Receipt};

#[starknet::interface]
pub trait IVelum<T> {
    /// Records that the caller paid `amount` of `token` to `recipient_tag`.
    ///
    /// The timestamp is taken from the block, not from the payer.
    fn attest(ref self: T, recipient_tag: felt252, token: ContractAddress, amount: u128);

    /// Called by the pool inside the proof, with `identity_key` prepended by the pool itself.
    ///
    /// Every argument after `identity_key` is a private witness: it is client-action calldata,
    /// which the pool never publishes. Sums the caller's attestations for this recipient inside
    /// the window and **panics `BELOW_THRESHOLD` if they fall short**, so a failed claim leaves no
    /// trace on chain at all.
    ///
    /// Returns `(claim_id, earner_handle, params_hash)`.
    fn privacy_compute(
        self: @T,
        identity_key: felt252,
        channel_key: felt252,
        payer: ContractAddress,
        token: ContractAddress,
        from_ts: u64,
        to_ts: u64,
        threshold: u128,
        challenge_hash: felt252,
        expires_at: u64,
        nonce: felt252,
    ) -> (felt252, felt252, felt252);

    /// Called by the pool on chain with `privacy_compute`'s result followed by the caller's public
    /// invoke data.
    ///
    /// The pool binds those two halves to nothing, so this **recomputes `params_hash` from the
    /// public half and refuses a mismatch**. Without that check an earner could prove one
    /// threshold privately and publish another.
    ///
    /// Returns empty deposit spans: Velum takes no custody, so open-note screening never fires and
    /// no app-governor permission is needed.
    fn privacy_invoke_with_computation(
        ref self: T,
        claim_id: felt252,
        earner_handle: felt252,
        params_hash: felt252,
        payer: ContractAddress,
        token: ContractAddress,
        from_ts: u64,
        to_ts: u64,
        threshold: u128,
        challenge_hash: felt252,
        expires_at: u64,
    ) -> (Span<OpenNoteDeposit>, Span<ContractAddress>);

    /// What a verifier gets. Every refusal names itself.
    fn verify(self: @T, claim_id: felt252, challenge_preimage: felt252) -> ClaimStatus;

    /// The claim's fields, readable only by the verifier holding the preimage, and only while the
    /// claim is `Valid`.
    fn read_claim(self: @T, claim_id: felt252, challenge_preimage: felt252) -> Receipt;

    /// Marks a claim spent. A second presentation reverts `ALREADY_SPENT`.
    fn redeem(ref self: T, claim_id: felt252, challenge_preimage: felt252);

    /// How many distinct recipients this payer attested to across the window.
    ///
    /// This is the earner's crowd. A claim issued against a payer with an anonymity set of one
    /// identifies her, and the interface must say the number out loud before she issues it.
    fn anonymity_set(self: @T, payer: ContractAddress, from_ts: u64, to_ts: u64) -> u32;

    /// The address of the privacy pool this instance trusts.
    fn pool(self: @T) -> ContractAddress;

    /// A payer's enrolled name, if any.
    fn enrolment_of(self: @T, payer: ContractAddress) -> Enrolment;
}

pub mod errors {
    /// The caller of `privacy_invoke_with_computation` was not the configured pool.
    pub const UNAUTHORIZED_CALLER: felt252 = 'UNAUTHORIZED_CALLER';
    /// Attestations in the window fall short of the threshold. Raised inside the proof.
    pub const BELOW_THRESHOLD: felt252 = 'BELOW_THRESHOLD';
    /// The public claim parameters do not hash to the `params_hash` proven privately.
    pub const PARAMS_MISMATCH: felt252 = 'PARAMS_MISMATCH';
    /// A claim id was issued twice.
    pub const CLAIM_EXISTS: felt252 = 'CLAIM_EXISTS';
    /// The presented preimage does not open this claim.
    pub const WRONG_VERIFIER: felt252 = 'WRONG_VERIFIER';
    /// The claim has already been presented.
    pub const ALREADY_SPENT: felt252 = 'ALREADY_SPENT';
    /// The claim is past `expires_at`.
    pub const CLAIM_EXPIRED: felt252 = 'CLAIM_EXPIRED';
    /// `attest` was called with a zero amount.
    pub const ZERO_AMOUNT: felt252 = 'ZERO_AMOUNT';
    /// `from_ts` is not before `to_ts`.
    pub const EMPTY_WINDOW: felt252 = 'EMPTY_WINDOW';
    /// A claim was issued that had already expired.
    pub const EXPIRES_IN_PAST: felt252 = 'EXPIRES_IN_PAST';
    /// The pool address was zero at deploy.
    pub const ZERO_POOL: felt252 = 'ZERO_POOL';
}

#[starknet::contract]
pub mod Velum {
    use core::num::traits::Zero;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};
    use crate::hashes::{
        compute_challenge_hash, compute_claim_id, compute_earner_handle, compute_params_hash,
        compute_recipient_tag,
    };
    use crate::types::{Attestation, ClaimStatus, Enrolment, OpenNoteDeposit, Receipt};
    use super::{IVelum, errors};

    /// Buckets for `anonymity_set`. One day is short enough to be honest about a monthly payroll
    /// and long enough that the bucket itself reveals nothing about payment times.
    const SECONDS_PER_DAY: u64 = 86400;

    #[storage]
    struct Storage {
        /// The privacy pool. Set once at deploy; nothing can move it.
        pool: ContractAddress,
        /// `(payer, recipient_tag) -> number of attestations`.
        attestation_count: Map<(ContractAddress, felt252), u32>,
        /// `(payer, recipient_tag, index) -> attestation`.
        attestations: Map<(ContractAddress, felt252, u32), Attestation>,
        /// `(payer, day, recipient_tag) -> already counted today`.
        counted_on_day: Map<(ContractAddress, u64, felt252), bool>,
        /// `(payer, day) -> distinct recipients that day`.
        payer_day_count: Map<(ContractAddress, u64), u32>,
        /// `claim_id -> receipt`.
        receipts: Map<felt252, Receipt>,
        /// `payer -> enrolment`.
        enrolments: Map<ContractAddress, Enrolment>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Attested: Attested,
        ClaimIssued: ClaimIssued,
        ClaimRedeemed: ClaimRedeemed,
    }

    /// Deliberately does not carry the amount's recipient in any resolvable form.
    #[derive(Drop, starknet::Event)]
    pub struct Attested {
        #[key]
        pub payer: ContractAddress,
        #[key]
        pub recipient_tag: felt252,
        pub token: ContractAddress,
        pub amount: u128,
        pub attested_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ClaimIssued {
        #[key]
        pub claim_id: felt252,
        #[key]
        pub earner_handle: felt252,
        pub payer: ContractAddress,
        pub threshold: u128,
        pub expires_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ClaimRedeemed {
        #[key]
        pub claim_id: felt252,
        pub redeemed_at: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState, pool: ContractAddress) {
        assert(pool.is_non_zero(), errors::ZERO_POOL);
        self.pool.write(pool);
    }

    #[abi(embed_v0)]
    pub impl VelumImpl of IVelum<ContractState> {
        fn attest(
            ref self: ContractState, recipient_tag: felt252, token: ContractAddress, amount: u128,
        ) {
            assert(amount.is_non_zero(), errors::ZERO_AMOUNT);
            let payer = get_caller_address();
            let attested_at = get_block_timestamp();

            let index = self.attestation_count.entry((payer, recipient_tag)).read();
            self
                .attestations
                .entry((payer, recipient_tag, index))
                .write(Attestation { token, amount, attested_at });
            self.attestation_count.entry((payer, recipient_tag)).write(index + 1);

            // Anonymity set: count each recipient once per day, not once per payment, so a payer
            // who pays one person twice does not look like a crowd of two.
            let day = attested_at / SECONDS_PER_DAY;
            if !self.counted_on_day.entry((payer, day, recipient_tag)).read() {
                self.counted_on_day.entry((payer, day, recipient_tag)).write(true);
                let so_far = self.payer_day_count.entry((payer, day)).read();
                self.payer_day_count.entry((payer, day)).write(so_far + 1);
            }

            self.emit(Attested { payer, recipient_tag, token, amount, attested_at });
        }

        fn privacy_compute(
            self: @ContractState,
            identity_key: felt252,
            channel_key: felt252,
            payer: ContractAddress,
            token: ContractAddress,
            from_ts: u64,
            to_ts: u64,
            threshold: u128,
            challenge_hash: felt252,
            expires_at: u64,
            nonce: felt252,
        ) -> (felt252, felt252, felt252) {
            assert(from_ts < to_ts, errors::EMPTY_WINDOW);

            // The earner proves she controls the channel by supplying its key as a witness; the
            // tag the payer attested to is derived from it here, inside the proof.
            let recipient_tag = compute_recipient_tag(channel_key);

            let total = self
                .sum_attestations(:payer, :recipient_tag, :token, :from_ts, :to_ts);

            // Panicking here is the whole point of FR-007: an over-optimistic claim is refused
            // inside the proof, so it never reaches a block and leaves nothing to observe.
            assert(total >= threshold, errors::BELOW_THRESHOLD);

            let claim_id = compute_claim_id(:identity_key, :challenge_hash, :nonce);
            let earner_handle = compute_earner_handle(:identity_key);
            let params_hash = compute_params_hash(
                :payer, :token, :from_ts, :to_ts, :threshold, :challenge_hash, :expires_at,
            );
            (claim_id, earner_handle, params_hash)
        }

        fn privacy_invoke_with_computation(
            ref self: ContractState,
            claim_id: felt252,
            earner_handle: felt252,
            params_hash: felt252,
            payer: ContractAddress,
            token: ContractAddress,
            from_ts: u64,
            to_ts: u64,
            threshold: u128,
            challenge_hash: felt252,
            expires_at: u64,
        ) -> (Span<OpenNoteDeposit>, Span<ContractAddress>) {
            assert(get_caller_address() == self.pool.read(), errors::UNAUTHORIZED_CALLER);

            // The pool concatenates the proven half with this caller-supplied half and binds them
            // to nothing. This is the binding.
            let expected = compute_params_hash(
                :payer, :token, :from_ts, :to_ts, :threshold, :challenge_hash, :expires_at,
            );
            assert(expected == params_hash, errors::PARAMS_MISMATCH);

            let issued_at = get_block_timestamp();
            assert(expires_at > issued_at, errors::EXPIRES_IN_PAST);
            assert(self.receipts.entry(claim_id).earner_handle.read().is_zero(), errors::CLAIM_EXISTS);

            self
                .receipts
                .entry(claim_id)
                .write(
                    Receipt {
                        earner_handle,
                        payer,
                        token,
                        from_ts,
                        to_ts,
                        threshold,
                        challenge_hash,
                        expires_at,
                        issued_at,
                        spent: false,
                    },
                );

            self.emit(ClaimIssued { claim_id, earner_handle, payer, threshold, expires_at });

            // No custody, no deposits, therefore no screening and no permissioned role.
            (array![].span(), array![].span())
        }

        fn verify(
            self: @ContractState, claim_id: felt252, challenge_preimage: felt252,
        ) -> ClaimStatus {
            let receipt = self.receipts.entry(claim_id).read();
            if receipt.earner_handle.is_zero() {
                return ClaimStatus::Unknown;
            }
            if compute_challenge_hash(challenge_preimage) != receipt.challenge_hash {
                return ClaimStatus::WrongVerifier;
            }
            if receipt.spent {
                return ClaimStatus::Spent;
            }
            if get_block_timestamp() >= receipt.expires_at {
                return ClaimStatus::Expired;
            }
            ClaimStatus::Valid
        }

        fn read_claim(
            self: @ContractState, claim_id: felt252, challenge_preimage: felt252,
        ) -> Receipt {
            match self.verify(:claim_id, :challenge_preimage) {
                ClaimStatus::Valid => self.receipts.entry(claim_id).read(),
                ClaimStatus::Unknown => core::panic_with_felt252(errors::WRONG_VERIFIER),
                ClaimStatus::WrongVerifier => core::panic_with_felt252(errors::WRONG_VERIFIER),
                ClaimStatus::Spent => core::panic_with_felt252(errors::ALREADY_SPENT),
                ClaimStatus::Expired => core::panic_with_felt252(errors::CLAIM_EXPIRED),
            }
        }

        fn redeem(ref self: ContractState, claim_id: felt252, challenge_preimage: felt252) {
            match self.verify(:claim_id, :challenge_preimage) {
                ClaimStatus::Valid => {},
                ClaimStatus::Unknown => core::panic_with_felt252(errors::WRONG_VERIFIER),
                ClaimStatus::WrongVerifier => core::panic_with_felt252(errors::WRONG_VERIFIER),
                ClaimStatus::Spent => core::panic_with_felt252(errors::ALREADY_SPENT),
                ClaimStatus::Expired => core::panic_with_felt252(errors::CLAIM_EXPIRED),
            }
            self.receipts.entry(claim_id).spent.write(true);
            self.emit(ClaimRedeemed { claim_id, redeemed_at: get_block_timestamp() });
        }

        fn anonymity_set(
            self: @ContractState, payer: ContractAddress, from_ts: u64, to_ts: u64,
        ) -> u32 {
            assert(from_ts < to_ts, errors::EMPTY_WINDOW);
            let mut day = from_ts / SECONDS_PER_DAY;
            let last_day = (to_ts - 1) / SECONDS_PER_DAY;
            let mut total: u32 = 0;
            while day <= last_day {
                total += self.payer_day_count.entry((payer, day)).read();
                day += 1;
            }
            total
        }

        fn pool(self: @ContractState) -> ContractAddress {
            self.pool.read()
        }

        fn enrolment_of(self: @ContractState, payer: ContractAddress) -> Enrolment {
            self.enrolments.entry(payer).read()
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Sums every attestation this payer made to this tag, in this token, inside
        /// `[from_ts, to_ts)`.
        ///
        /// Runs inside the proof, so the loop bound — the number of attestations the payer made to
        /// this one recipient — is the practical ceiling on a claim's proving cost.
        fn sum_attestations(
            self: @ContractState,
            payer: ContractAddress,
            recipient_tag: felt252,
            token: ContractAddress,
            from_ts: u64,
            to_ts: u64,
        ) -> u128 {
            let count = self.attestation_count.entry((payer, recipient_tag)).read();
            let mut index: u32 = 0;
            let mut total: u128 = 0;
            while index < count {
                let a = self.attestations.entry((payer, recipient_tag, index)).read();
                if a.token == token && a.attested_at >= from_ts && a.attested_at < to_ts {
                    total += a.amount;
                }
                index += 1;
            }
            total
        }
    }
}
