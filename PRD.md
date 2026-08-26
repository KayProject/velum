# Velum — Product Requirements

**Owner** jadonamite · **Status** approved for build · **Written** Aug 26, 2026
**Ships against** STRK20 Private Sprint, Aug 31 2026 23:59 UTC
**Spec of record** `specs/velum/spec.md` — this document is the product view; the spec is the
requirement view. Where they disagree, the spec wins.

---

## 1. The problem

Confidential payment rails are arriving quickly. They solve one problem completely and create a
second one nobody owns.

When your income is encrypted, **you cannot prove it.** Not to a landlord, not to a lender, not
to an insurer, not to a visa officer. The record exists, it is yours, and it is unreadable by
every institution that routinely demands to see it.

The existing answer to this question is forty years old and works well: a bureau holds employer
records, and when you apply for credit the lender pulls a verification you authorised, scoped to
that one lender and that one moment. It fails here for a structural reason — **there is no
institution that can see the payments.** The earner holds notes only they can open.

## 2. Who this is for

**Primary — the earner who has no employer to ring.**
Freelancers with several clients. Independent contractors. DAO contributors. Pseudonymous
workers. People paid across multiple platforms. Anyone whose payer is unwilling, unable or too
fragmented to write a letter on headed paper.

**Secondary — the payer.** An employer, agency or DAO that already pays privately and would
rather its people be bankable than have them re-expose the payroll to prove it.

**The verifier is not a user we court.** Landlords, lenders and visa officers will not install
anything, will not create an account, and will not learn a new concept. They get a link and one
sentence. If that is not enough for them, the product has failed and no amount of feature work
recovers it.

**Explicitly not for:** anyone whose employer will simply sign a letter. That has been a PDF and
a database since 1985 and the database is better. Saying so is part of the positioning.

## 3. What the user does

**The earner.** Chooses four things — *who* paid them, *when*, *how much* to prove as a floor,
and *who needs to know*. Presses one button. Sends back a link.

**The payer.** Publishes one attestation per payment at pay time, alongside a payment they were
making anyway. Nothing they learn about the earner exceeds what paying them already required.

**The verifier.** Opens the link. Reads one line. Closes the tab.

The whole product should feel almost boring. That is the feature. Verification is a chore for
everyone involved and the correct emotional register is *relief that it took ten seconds*, not
delight at a novel cryptographic experience.

## 4. Product principles

1. **If one fact is sufficient, don't disclose a hundred.**
2. **Don't reveal the record. Prove the claim.**
3. **The verifier is not a crypto user and never will be.**
4. **Precision is the product.** Every guarantee is stated exactly — what is proven, what is
   signed, what is checkable on chain — because a verifier's confidence comes from knowing
   precisely what they are relying on. Exactness is what makes the claim usable in a lease, a
   loan file or a visa application.
5. **Never hold value and never hold a key.** Custody and key custody are both surveillance
   surfaces wearing different hats.

## 5. Scope

### In — v1 (the sprint)

- Payer attestation: one payment, one call, against an unlinkable recipient commitment.
- Earner claim generation: payer, window, threshold, verifier binding, expiry.
- Verifier page: valid / invalid / expired, one line, no wallet, no account.
- Verifier-bound challenge, so a claim presented to anyone else fails.
- Single-use claims, so a captured link cannot be replayed.
- Named payer enrolment, with unenrolled payers rendered as **self-declared and unattested**.
- Anonymity warning when the payer's attestations in that window are few enough that the claim
  narrows the earner to a handful of people — stating the size of that set, not a vague caution.
- Earner's issued-claims log with revocation, and an access record showing which verifiers
  actually opened which claim.

### Out — v1

- Building or replacing private payroll. Sixteen teams are doing that this month; they are
  suppliers.
- Credit scoring, risk models, or any opinion on whether the income is *good enough*.
- Proving income from outside the pool — bank statements, other chains, other privacy systems.
- Fiat rails, on-ramps, KYC, cross-chain anything.
- Making a payer's name trustworthy in the world. Velum proves the payer signed. It does not
  certify that Acme DAO is real or solvent.
- Any claim of end-to-end zero-knowledge.

## 6. Release plan

| | What ships | Alone, is it a product? |
|---|---|---|
| **P1** | Payer attests · earner claims · verifier sees one line · verifier-bound, single-use, expiring | **Yes.** This is the entire thesis and the demo video |
| **P2** | Named payer enrolment; batch attestation for a whole payroll run in one transaction | Improves trust and is the integration surface for upstream payroll teams |
| **P3** | Revocation, key rotation, issued-claims log, access record | Turns a demo into something someone would actually rely on |

P1 must stand alone. If it does not demonstrate on its own, the slicing is wrong.

## 7. How we know it worked

| Measure | Target |
|---|---|
| Verifier time-to-answer, cold, on a phone, nothing installed | **< 60 seconds** |
| Claim presented to the wrong verifier | Fails every time, with the reason named |
| Claim presented twice | Fails on the second attempt |
| Balance, amount, counterparty or earner address recoverable from the public record | **None, ever** |
| Claim issued above the true total | Impossible, and the failed attempt leaves no on-chain trace |
| Live mainnet transactions produced by the real flow | **≥ 3**, required to be scored at all |
| Second developer runs the verifier from the README alone | Without contacting the author |

## 8. Risks

| Risk | Response |
|---|---|
| Judges read "income proof" as the crowded selective-disclosure category | Lead with the *problem* — a shielded salary is an unprovable salary — not with the mechanism |
| The proven/attested split reads as a weakness | State it first, in our own words, with the reason. Volunteered limits read as rigour; discovered ones read as spin |
| Amounts in payer attestations are a real leak | Declared everywhere, and framed correctly: the guarantee is unlinkability |
| Nobody has private income yet, so there is nothing to prove | The payer console makes the demo self-contained: a second wallet is a payer |
| Five days | P1 is the whole submission. P2 and P3 are upside |
