# Velum

**Prove what matters. Reveal nothing else.**

Velum turns private income into a claim you can hand to a landlord, a lender, an insurer or a
visa officer.

```
Qualifying income from Acme DAO exceeded ₦4,200,000 between 1 Jan and 31 Mar.

No other financial information was disclosed.
Expires in 18 days.
```

That is the entire thing they receive. One line, time-limited, issued to them alone.

---

## Privacy shouldn't make you financially unverifiable

Confidential payment rails are arriving fast, and they work: your salary is encrypted, and
nobody can read it.

Then you apply for a flat.

Every landlord, lender, insurer and visa office on earth asks for an income history. Once your
income is private, you cannot produce one — not because you have anything to hide, but because
the record no longer exists in a form any institution can read. **Private financial data creates
a new problem: proving what is hidden.**

Velum solves it. **Don't reveal the record. Prove the claim.**

## Don't reveal the record. Prove the claim.

You choose four things:

| | |
|---|---|
| **WHO** | which payer the income came from |
| **WHEN** | the period it covers |
| **HOW MUCH** | the minimum you need to prove |
| **WHO NEEDS IT** | the one verifier who gets to check |

Velum produces a time-limited proof. The verifier sees 🟢 **Verified** and one sentence.

**What stays yours:** your balance. Every individual transaction. Every other income source. All
unrelated activity. Anything outside the period you picked.

> If one fact is sufficient, don't disclose a hundred.

## How it works

**The payer** publishes one attestation per payment at the moment they pay — recipient
commitment, amount, token, period — alongside a payment they were making anyway. Because
attestations are signed with the payer's own key, an income record cannot be manufactured by
anyone else.

**The earner** picks a payer, a window and a threshold, pastes the verifier's code, and presses
one button. A single private transaction proves control of those payments through the pool's
per-contract identity anchor — a value derived from your viewing key that nobody can produce
without it, and that is a **different value at every other application**, so your Velum identity
cannot be correlated with you anywhere else.

**The verifier** opens a link and reads a line. No wallet. No account. No install. No login.

Velum never takes custody of a single token, never holds a key, and never asks permission from
an operator, an allowlist, or a governance role.

## What the verifier can rely on

| | |
|---|---|
| **Cryptographic proof** | that the person presenting this claim controls the income records behind it |
| **Signed by the payer** | that the payment happened, at that size, on that date |
| **Checkable on chain** | the period boundaries, independent of anything Velum says |
| **Bound to them alone** | presented to anyone else, the claim fails |
| **Single-use** | a captured link is worthless |
| **Expiring** | after the window you set, it stops answering |

## Who it's for

Freelancers with several clients. Independent contractors. DAO contributors. Pseudonymous
workers. Anyone paid across multiple platforms. Everyone whose income is real, verifiable and
completely invisible to the systems that gate housing and credit.

## The layer, not the competitor

Private payroll protocols produce the encrypted records. Velum turns them into selective,
time-bound, verifiable claims. **They are upstream suppliers, not rivals** — every team shipping
confidential payroll makes Velum more useful, and Velum makes their users bankable.

## Repository

| Path | Holds |
|---|---|
| `contracts/` | The Velum contract — attestations, receipts, verification |
| `app/` | Earner interface, payer console, verifier page |
| `docs/` | Architecture, cryptographic construction, threat model |
| `PRD.md` | What the product is and who it is for |
| `strk20.json` | Sprint scoring manifest |

Requirements and success criteria: `../../specs/velum/spec.md`.

## Licence

Apache-2.0. See `LICENSE`.
