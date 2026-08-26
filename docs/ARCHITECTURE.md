# Velum — Architecture

Written Aug 26, 2026. Everything below was read in the privacy pool's own source, not in its
documentation. Where the two disagree, the source is recorded here.

---

## The seven questions

An architect should be able to answer these without hedging. These are the answers.

### 1. What data is encrypted?

Not by Velum — Velum encrypts nothing. The pool's notes carry encrypted amounts, additively
masked with a one-time pad derived from a channel key. Velum's own storage holds no ciphertext
at all: it holds commitments, receipts, expiries and verifier bindings.

### 2. Who holds or controls the decryption capability?

The earner, via a single viewing key derived from a passphrase and their address by a
thousand-round Poseidon KDF, rejected by the pool unless canonical. Plus the protocol's auditor,
whose public key is set by a governance role — this is a property of the pool and applies to
every application on it, Velum included.

**Velum never receives, holds, escrows or proxies a viewing key.** There is no scoped key, no
delegated key and no per-period key, because the pool has no such primitive: `SetViewingKey`
writes one key per address. Any product promising a scoped, expiring decryption grant on this
substrate is implementing it in a trusted server, which is the surveillance credential it claims
to abolish.

### 3. What exactly is the cryptographic statement?

Two statements, made by two different parties, and Velum never conflates them:

**A — by the payer, at pay time.**
> "I, the holder of this address, assert that I paid `commitment` an amount of `A` in token `T`
> for period `P`."

Signed. Not zero-knowledge. Unforgeable *by the earner*, because a channel key derives from the
sender's private key: a recipient cannot manufacture a payer's binding.

**B — by the earner, at claim time.**
> "I control the recipient commitments named in this set of payer attestations."

Proven, natively, by the pool: the earner's action set runs inside a proven virtual block, and
the identity anchor `h(TAG, user_addr, user_private_key, contract_address)` is derived by the
pool and passed to Velum's computation entry point. It cannot be produced without the viewing
key, and it is scoped to Velum's contract address — the same person's anchor at any other
application is a different value and cannot be correlated with this one.

The claim shown to the verifier is the arithmetic consequence: the attestations the earner
controls, from the named payer, inside the window, sum to at least the threshold.

### 4. Is the verifier checking a ZK proof, a cryptographic attestation, or a signed claim?

**All three, in layers, and the product says which is which.**

| Layer | Kind |
|---|---|
| Earner controls the commitments | Validity proof, verified by the chain |
| Payment happened, this size, this payer, this date | Signed claim by the payer |
| Window boundaries | Block timestamps — independently checkable, not asserted by Velum |
| Disclosure and expiry policy | Contract logic |

Anyone describing this whole stack as zero-knowledge is overselling. Velum's front page names
the split before a judge, an auditor or a journalist finds it.

### 5. How is selective disclosure enforced?

By construction rather than by policy. Velum's contract never holds an amount, a balance or an
address, so there is nothing to leak by mistake, misconfiguration or subpoena. The verifier's
query returns a boolean plus the fields of the claim itself. There is no endpoint that returns a
record, because there is no record.

The earner selects four things: which payer, which window, which threshold, which verifier.
Everything outside that selection was never given to Velum in the first place.

### 6. How does expiry work?

Each receipt carries an expiry. After it, the verification endpoint returns *expired* and
displays no financial fact.

**And expiry bounds re-verification, not knowledge.** A verifier who saw the green tick knows
the fact permanently. This is a limit of the physical universe, not of the implementation, and
it is written in the README rather than glossed. What expiry buys is that the claim cannot be
re-run later, sold, filed, or relied on by a party who acquired it second-hand.

### 7. Can the proof be replayed by someone else?

No, twice over.

**Bound to the verifier.** The verifier supplies a challenge before the claim is generated, and
the challenge is committed inside the receipt. A claim presented to any other verifier fails
with the reason named.

**Single-use.** A claim is spent against its challenge on first successful verification. A
captured link presented a second time fails.

---

## Why not the obvious design

The obvious build proves the total by moving it: spend the qualifying notes, route the value
through Velum so the pool's own balance-netting establishes the amount, hand it straight back.
The pool proves everything and Velum asserts nothing.

**It is blocked, and not by anything we can engineer around.**

The only channel through which the pool hands a *proven amount* to an external contract is an
open-note deposit returned from the invoke. Every open-note depositor carries a screening
policy, defaulting to `Required`. A `Required` depositor's deposits apply only if the
transaction carries a fresh attestation signed by the protocol's off-chain screener over that
depositor's address. The only function that moves a contract to `Exempt` or `Delegated` is
restricted to the protocol's app-governor role.

**A contract deployed by a third party cannot deposit.** Recorded here because it is the single
most expensive thing to discover late, and because every other team reaching for the same trick
will hit it.

The consequence is the two-party split above, which needs no deposits, no custody, no screening
and no permission from anybody.

---

## Trust and threat model

| Party | Can | Cannot |
|---|---|---|
| **Velum contract / author** | See commitments, receipts, expiries, verifier bindings | Read any balance, link a commitment to a person, decrypt anything, move value |
| **Verifier** | Learn one boolean and the claim's own fields, permanently | Learn amounts, balances, other income, other periods, the earner's address; re-use the claim; give it to anyone else |
| **Payer** | Attest their own payments; learn what paying already told them | Forge a claim on the earner's behalf; see the earner's other income |
| **Earner** | Choose what to disclose, to whom, for how long; revoke | Overstate a total — attestations are payer-signed; impersonate another commitment |
| **Chain observer** | See that *some* commitment received *some* amount on *some* date; see that a claim was verified | Link two payments to one earner; reach a person without their viewing key |
| **Pool operator / proving service** | See action sets in cleartext at proving time | — a property of the pool, disclosed rather than hidden |
| **Protocol auditor** | Decrypt, by design, protocol-wide | — applies to every application on this pool, not only Velum |

## The declared leak

Payer attestations carry the amount in clear against an unlinkable recipient commitment. The
chain shows that a commitment received that much on that date. It shows no address, no name, no
balance, no link between two payments to the same earner, and no route to the person without
their viewing key.

**Velum guarantees unlinkability, not amount-hiding.** That sentence appears in the README, the
product, and the video.
