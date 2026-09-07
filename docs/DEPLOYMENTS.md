# Deployments

## Signing account (mainnet)

| | |
|---|---|
| Address | `0x07a92ded878f2d353a2155099df9838860ac00605153a1f4b58debf5b8e9d005` |
| Type | Ready (Argent), sncast default class hash `0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f` |
| sncast profile name | `velum-mainnet-argent` |
| Derived | 2026-08-30, from the private key in `.env.local`, via `sncast account create --type ready` |
| Funded | 2026-08-30, 20 STRK |
| Deployed | 2026-08-30 — tx `0x048f28083369c5cf357f6b915d1b91ceb7dad9a9f9da716dd8036aa1ba6c704f` |
| Balance now | ~8.80 STRK (after deploy fee + one 11 STRK shield) |

Note: an earlier candidate signing key was tested against Jadon's real Argent X wallet
(`0x06b7E893c04a148548AC5b552a0039e31da485755e3F5d30558dfACA0eFE108D`, verified holding 77.44 STRK)
but did not reconstruct that address — likely a guardian/2FA account, whose constructor calldata
includes a second key this derivation can't see. That wallet was left alone; this project uses its
own dedicated signing account instead.

## Velum contract (mainnet)

| | |
|---|---|
| Address | `0x6f88f48e15e4325a0420da61bc933cdba982aba429c3eec5e445cfa3937ca05` |
| Class hash | `0x3fd290e02b2ba1242cf70cb39534c90f4677720e6eaf4470fdd2ac71f5d8dea` |
| Declare tx | [`0x243c139f71e42590dc23ab586ed5818e54891e233add8499785705aee1d1e39`](https://voyager.online/tx/0x243c139f71e42590dc23ab586ed5818e54891e233add8499785705aee1d1e39) — `SUCCEEDED`, block 14126889 |
| Deploy tx | [`0xcd0fb5ac9068a3248623d479dc6b5db8b31a482cc6cf6010c095ea2824c4e3`](https://voyager.online/tx/0xcd0fb5ac9068a3248623d479dc6b5db8b31a482cc6cf6010c095ea2824c4e3) — `SUCCEEDED`, block 14126902 |
| Constructor calldata | `pool = 0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a` |

Verified post-deploy: `pool()` view call returns the correct pool address. Deployed 2026-08-31 via
`contracts/scripts/deploy.mjs` (a starknet.js script, not `sncast`) — `sncast declare`/`deploy` always
probe the RPC with a `"pre_confirmed"`/`"pending"` block_id as part of their own version-compatibility
check, and the RPC backend only answers `"latest"`; every sncast
attempt failed `Invalid block id` regardless of explicit `--nonce`/`--l1-gas`/etc overrides.
`deploy.mjs` forces `blockIdentifier: "latest"` on every internal call instead.

Cost: declare needed ~24-36 STRK (mostly `l2_gas`, ~688M units — Sierra→CASM verification for a new
class, not something safely shrinkable), funded from the same signing account as the shield tx.

## Pool transactions

| Hash | Kind | Amount | Status |
|---|---|---|---|
| [`0x63de9b703218cc837719cbd4547f34b7d9c18826d97153ba04aeaea5eb17d62`](https://voyager.online/tx/0x63de9b703218cc837719cbd4547f34b7d9c18826d97153ba04aeaea5eb17d62) | shield (deposit) | 5 STRK net (11 STRK gross: 5 + 6 protocol fee) | `SUCCEEDED` / `ACCEPTED_ON_L2`, block 14120064 |
| [`0x42ec49bb89312cb7770c4bc1e9148e30c8d76a80394814a830c9d605beb9341`](https://voyager.online/tx/0x42ec49bb89312cb7770c4bc1e9148e30c8d76a80394814a830c9d605beb9341) | redeem (withdraw) | 1 STRK out, 7.01 STRK topped up (1 redeem + 6 fee + 0.01 surplus) | `SUCCEEDED` / `ACCEPTED_ON_L2`, block 14127275 |
| [`0x242bd820e864d76f905537f2fe72f001f462d39589851fd95745cc8c825c4cc`](https://voyager.online/tx/0x242bd820e864d76f905537f2fe72f001f462d39589851fd95745cc8c825c4cc) | shield (deposit, top-up) | 9 STRK gross debited from public balance (3 STRK intended deposit + 6 STRK fee — see cost note below) | `SUCCEEDED` / `ACCEPTED_ON_L2`, block 14127697 |

All three of the `strk20.json` needs are now landed (T002 — done). All three went via `scripts/shield.ts` /
`scripts/redeem.ts` through an AVNU paymaster (`sponsored_private` mode) — a plain
`account.execute()` cannot submit this pool's `apply_actions`, since it validates a custom
`execution_info.tx_info.proof_facts` field (`privacy.cairo:808`) that only a paymaster-relayed
transaction can attach. See each script's header comment and `docs/SHIELDING.md` for the full
mechanism, including:
- why the deposit amount must include the protocol fee on a first-ever shield (no pre-existing
  private balance to draw the fee reimbursement from otherwise)
- why a redeem needs a small positive surplus, not an exact net-zero — every client transaction
  needs at least one `WriteOnce` action for replay protection (`privacy.cairo:267-309`), and a
  net-zero redeem creates no change note, reverting `NO_REPLAY_PROTECTION`

**Cost bug found 2026-08-31:** `shield.ts` always deposits `amount + feeAmount` on every run, not
just a first-ever shield — the header comment claims the fee is "paid privately, folded into the
proof," but the code unconditionally folds it into the public `deposit` amount. This top-up run
intended a 3 STRK deposit and paid 9 STRK from the public balance (the 6 STRK fee was unnecessary —
private balance already had enough from the first shield to cover it). Explains the ~9.2 STRK public
balance drop that looked unaccounted for at session start; no funds are missing, all 11 nonces on the
signing account are accounted for. Fix before running `shield.ts` again: only add the fee to the
deposit when the private balance is known to be zero.

A `compute_and_invoke` call against the Velum contract's own product path (§3 of `HANDOVER.md`) is
still the harder, unresolved item — the numeric `strk20.json` bar above is now satisfied independent
of it.
