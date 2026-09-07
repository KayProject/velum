# Handover — Velum STRK20 engine, compute_and_invoke bug

**Updated** 2026-08-31, ~15:40 GMT+1 (~14:40 UTC) · **Deadline 2026-08-31 23:59 UTC — roughly 9
hours left at time of writing.** Account: jadonamite. Read this first, it is the map. This
replaces the earlier (~02:45 UTC) version of this file — that one is stale, this one supersedes it.

---

## 0 · Plain-language summary

Velum lets an "earner" prove, privately, that they were paid enough by some payer — without
revealing which specific payment or which private channel they hold — and get a signed claim
receipt for it. Mechanically: a payer calls Velum's public `attest()` (records a payment against
an opaque `recipient_tag` a payer doesn't know is linked to any real identity). Later, the earner
who actually holds the `channel_key` behind that tag reaches Velum *only through the STRK20
privacy pool's `ComputeAndInvoke` mechanism* — the pool calls Velum's `privacy_compute` (checks
the sum of attestations clears a threshold, computes a claim id) inside a zero-knowledge proof,
then calls Velum's `privacy_invoke_with_computation` on-chain with that result, which writes a
`ClaimIssued` receipt. The earner's identity/channel key never appears on chain. This
`compute_and_invoke` path is Velum's actual product — the interesting/hard part, not just
"send tokens privately."

**What's done and proven:** contract deployed and correct on mainnet; three separate real pool
transactions landed on mainnet (shield, redeem, a top-up shield) satisfying the hackathon's
numeric "≥3 verified pool transactions" bar, independent of the bug below; every individual piece
of the compute_and_invoke path (calldata construction, Velum's ABI/logic, the SDK's proof
construction) has been proven correct via free local simulation against real on-chain state.

**What's not done:** a real, broadcast `compute_and_invoke` transaction has never succeeded. Every
real attempt reverts on-chain with `argent/multicall-failed` / `INVALID_INVOKE_RETURN_DATA`. This
is now understood to almost certainly be a bug in the third-party **Argent-class shadow account**
that the AVNU paymaster uses to submit pool transactions anonymously — not in Velum's contract,
not in the calldata, not in the SDK's proof construction (see §3 for the evidence trail).

**Current literal blocker to trying again:** the account's private (shielded) balance is currently
uncertain but inferred to be around 5.0 STRK, while the pool's live protocol fee
(`get_fee_amount()`) is 6.0 STRK — i.e. balance may currently be *below* the fee, meaning a real
`claim.ts` run would fail on insufficient funds before even reaching the bug being investigated.
**First command in a new session: re-verify actual public and private balances (see §2), then
top up if needed, before attempting anything else.**

---

## 1 · What's actually done (verified on-chain, real mainnet) — the numeric bar is MET

| Item | Status |
|---|---|
| Velum contract deployed | `0x6f88f48e15e4325a0420da61bc933cdba982aba429c3eec5e445cfa3937ca05`, class hash `0x3fd290e02b2ba1242cf70cb39534c90f4677720e6eaf4470fdd2ac71f5d8dea`. `pool()` verified returns the correct pool address. ABI verified byte-for-byte against source via `scripts/probe_abi.ts` (see §3). |
| Pool tx #1 — shield | `0x63de9b703218cc837719cbd4547f34b7d9c18826d97153ba04aeaea5eb17d62` — SUCCEEDED |
| Pool tx #2 — redeem | `0x42ec49bb89312cb7770c4bc1e9148e30c8d76a80394814a830c9d605beb9341` — SUCCEEDED |
| Pool tx #3 — shield top-up | `0x242bd820e864d76f905537f2fe72f001f462d39589851fd95745cc8c825c4cc` — SUCCEEDED, block 14127697. **Note:** this shield debited 9 STRK gross (3 intended + 6 protocol fee) due to the shield.ts bug in §7 — not a mistake in the record, just note it if the number looks odd. |
| Pool tx #4 — compute_and_invoke claim | **blocked, unresolved** — see §3 |

**strk20.json and docs/DEPLOYMENTS.md both already have all 3 of the above transactions recorded.
The "≥3 verified mainnet pool transactions" scoring bar (docs/SPIKE.md) is MET regardless of how
§3 goes.** Do not re-do this work. `demo_video` field in strk20.json is still empty — see §6.

---

## 2 · Key facts, addresses, credentials

- **Signing account:** `0x07a92ded878f2d353a2155099df9838860ac00605153a1f4b58debf5b8e9d005`
  (Ready/Argent-type account). Private key, passphrase, everything needed is already in
  `~/Projects/Inertia/projects/velum/.env.local` (gitignored) — fully wired, nothing to derive.
- **Pool:** `0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a`
- **Velum contract:** `0x6f88f48e15e4325a0420da61bc933cdba982aba429c3eec5e445cfa3937ca05`
- **STRK token:** `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
- **The Argent-class account implicated in the bug:** `0x18df1f1940a62def9b8efb8b8506352419d439a2363cc154bc102c374cb3339`, class hash `0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003`. Confirmed via `getClassByHash` to have an Argent-account ABI (`__execute__`, `__validate__`, `IArgentAccount`, `IOutsideExecution`, `change_owner`, `change_guardian`, ...). This is **not** the user's own signing account (`0x07a92ded...` above) and not an AVNU forwarder contract — it is a disposable "shadow account" the paymaster uses to submit pool transactions anonymously (see `MAINNET_SHADOW_ACCOUNT_ANONYMIZER_ADDRESS` config — related but not identical concept, see §3). Every real failed broadcast fails inside **this** contract's `__execute__` multicall.
- **Public STRK balance:** was ~19.3 STRK as of the last check this session (dropped from ~28.5
  STRK across several real+reverted attempts and the shield.ts overpayment bug). **Re-check before
  doing anything else** — reverted on-chain attempts still burn real gas even though the state
  change rolls back. Query via the local RPC proxy (must be running — see §5):
  ```bash
  curl -s -m 15 -X POST http://127.0.0.1:8547 -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"starknet_call","params":{"request":{"contract_address":"0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d","entry_point_selector":"0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e","calldata":["0x07a92ded878f2d353a2155099df9838860ac00605153a1f4b58debf5b8e9d005"]},"block_id":"latest"},"id":1}'
  ```
- **Private (shielded) balance: UNCERTAIN, not directly queryable on-chain.** There is no view
  function for it — it only surfaces indirectly, from what a script's compiler prints on a
  balance-related error (e.g. "Surplus of X found" or "Withdraw amount must be positive"). During
  this session's probing (`scripts/probe_prove.ts`), surplus-error arithmetic implied the balance
  was close to **5.0 STRK** at that point — but this is inferred, not authoritative, and more
  probe runs and a possible top-up may have happened since. **The pool's live protocol fee
  (`get_fee_amount()`) was 6.0 STRK** at last check — if private balance is still ~5.0, it is
  *below* the fee, and any real claim attempt needs the balance topped up first (see §7 for the
  shield.ts bug to watch out for when doing this).

---

## 3 · The stuck problem: compute_and_invoke against Velum

**Script:** `scripts/claim.ts` — the real, product-representative script. Not working yet.

**What it does:** calls `attest()` publicly (a payer attests a payment to a recipient_tag), waits
for it to clear a proving-margin block window, then tries to claim it via the pool's
`ComputeAndInvoke`, which calls Velum's `privacy_compute` (inside the proof) and
`privacy_invoke_with_computation` (on-chain, via the pool).

### 3.1 · Bugs found and fixed earlier this session (don't redo)
1. Extra spurious `"0"` felts in `compute_calldata`/`invoke_calldata` — u128 params are single
   felts here, not Uint256 pairs. Fixed.
2. `BELOW_THRESHOLD` revert — the proof was built against a block 10 behind head (a fixed margin
   the paymaster needs so its view of head isn't "too recent"), but the attest had just landed
   within that margin, so `sum_attestations` ran against state predating it. Fixed by capturing
   the attest's real block number and polling until the chain clears it before picking the proving
   block (see the `PROVING_MARGIN` loop in both `claim.ts` and `probe_prove.ts`).

### 3.2 · The current blocker — everything ruled out, one live hypothesis left

Every real broadcast attempt (`claim2.log`, `claim5.log` in `/tmp/`) fails identically:
```
Paymaster paymaster_executeTransaction: An error occurred (TRANSACTION_EXECUTION_ERROR) (code: 156):
execution error Execution error Nested(InnerContractExecutionError {
  contract_address: 0x18df1f1940a62def9b8efb8b8506352419d439a2363cc154bc102c374cb3339,
  class_hash: 0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003,
  selector: 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad,
  error: Message("(0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'),
                   0x1,
                   0x494e56414c49445f494e564f4b455f52455455524e5f44415441 ('INVALID_INVOKE_RETURN_DATA'),
                   0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'),
                   0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))")
})
```
Read right to left: `INVALID_INVOKE_RETURN_DATA` panics somewhere, wrapped twice in
`ENTRYPOINT_FAILED`, surfacing as call index `0x1` failing inside the Argent-class account's
`argent/multicall-failed`.

**This session's methodology: build four small, free/cheap probe scripts (all in `scripts/`,
uncommitted, throwaway, safe to delete once the bug is fixed or the deadline passes) to test each
layer independently, cheapest first:**

1. **`scripts/probe_compute.ts`** — calls Velum's `privacy_compute` directly (no caller-restriction
   on this one) with fabricated inputs via `provider.callContract` (free, read-only). Result:
   reverts with `BELOW_THRESHOLD` — the *expected* business-logic error, proving the calldata shape
   decodes correctly.
2. **`scripts/probe_invoke.ts`** — does one real tiny (1 wei) public `attest`, waits for
   confirmation, calls `privacy_compute` with real data to get a genuine 3-felt `compute_result`,
   then calls `privacy_invoke_with_computation` **directly** (bypassing the pool) with
   `[...computeResult, ...invoke_additional_data]`. Result: reverts with `UNAUTHORIZED_CALLER` —
   the function's very *first* assert — proving the full 10-felt calldata decodes with zero generic
   deserialization error.
3. **`scripts/probe_abi.ts`** — fetches the real deployed contract's ABI via `getClassHashAt` +
   `getClassByHash` and diffs the `outputs` field for both functions against `velum.cairo` source.
   Result: exact match — `(felt252, felt252, felt252)` for `privacy_compute`,
   `(Span<OpenNoteDeposit>, Span<ContractAddress>)` for `privacy_invoke_with_computation`. Rules out
   deployment drift.
4. **`scripts/probe_prove.ts`** — **the decisive probe.** Replicates the exact real-world action
   shape (see `sdk-wallet.js`'s `strk20InvokeTransaction`, which silently appends a second fee
   `withdraw` action beyond whatever the caller passes — a structural detail not visible from
   `claim.ts` alone) and calls `prover.prove(actions, /* simulate = */ true)` — a **free, no-cost,
   no-broadcast local simulation** that itself calls the pool's real `apply_actions` entrypoint via
   `starknet_call`. Tested twice successfully:
   - Single withdraw (full balance) + `compute_and_invoke` → succeeded, valid `apply_actions`
     calldata (35 felts).
   - Split withdraw (arbitrary in-budget 3.0 + 2.0 STRK, sandwiching `compute_and_invoke`, matching
     the real two-withdraw shape `strk20InvokeTransaction` actually constructs) → **also succeeded**,
     valid calldata (47 felts), zero errors.
   Along the way hit and resolved three balance-accounting-only errors ("Surplus of X found... no
   surplus action found", `NO_REPLAY_PROTECTION` from testing `compute_and_invoke` alone with no
   paired withdraw, "Withdraw amount must be positive" from a stale assumed balance) — all
   confirmed to be artifacts of guessing at the current private balance for the probe, not evidence
   of the real bug.

**Conclusion from all four probes: every layer we control — calldata construction, Velum's
contract logic and ABI, and the SDK's full proof/simulation construction against real on-chain
state — is proven correct. The bug is isolated specifically to the real, paid broadcast path
through the AVNU paymaster → the Argent-class shadow account's on-chain `__execute__` multicall.**
This is something outside our source, only reproducible with a real (fee-costing) broadcast.

**The one live, not-yet-tested hypothesis (found via `starknet-privacy`'s own test suite):**
`packages/privacy/src/tests/test_utils.cairo` has a test,
`test_deserialize_invoke_return_data_rejects_data_after_the_addresses`, which proves
`deserialize_invoke_return_data` panics with exactly `INVALID_INVOKE_RETURN_DATA` if there is
**any** extra felt left over after parsing the `Span<ContractAddress>` — i.e. the deserializer is
strict about trailing data. Velum's own return value serializes cleanly with nothing trailing (see
`velum.cairo:308`, `return (array![].span(), array![].span())`) — confirmed via `probe_invoke.ts`
and `probe_abi.ts`. **Working theory:** the Argent-class shadow account's `__execute__` multicall
may append its own wrapper metadata (a call-index marker, a status felt, or similar) to a nested
call's raw return data before something downstream tries to parse it as the pool's expected
return shape — meaning the trailing-data rejection is real, but the extra data is coming from
Argent's multicall wrapper, not from Velum. This has **not** been directly confirmed — it is the
strongest remaining hypothesis, not a proven root cause.

**Next debugging step, if time allows:** `docs/SPIKE.md` (line ~141, referencing the hackathon's
`projects.json` line ~149) notes that another hackathon project, **`ToXMon/backerzero-strk20`**,
successfully ran a real `compute_and_invoke` on mainnet. If reachable, compare their action
construction / account type / calldata shape against ours — this is the fastest remaining path to
either a fix or a confirmed "this is an upstream bug, not ours" conclusion. Have not yet looked at
their repo this session.

**If this can't be resolved in remaining time:** the numeric bar is already met (§1) — ship
honestly noting the compute_and_invoke path is built, proven correct end-to-end except for the
final broadcast step, and blocked on what looks like a third-party (Argent shadow account) bug.
Do not claim it works if the broadcast still fails.

---

## 4 · Immediate next actions, in order

1. **Re-verify current public and private STRK balances** (§2) — don't trust any number in this
   document, they're all snapshots from earlier in the session.
2. If private balance is at or below the current protocol fee (6.0 STRK last seen), top up via
   `scripts/shield.ts` — **but see §7 first**, it has a known overpayment bug when there's already
   a private balance to draw the fee from.
3. Optionally, spend a little time on `ToXMon/backerzero-strk20` as a reference (§3) before
   spending real STRK on another broadcast attempt — free, might reveal the fix directly.
4. Attempt one more real `claim.ts` broadcast. If it succeeds: add the tx hash to
   `docs/DEPLOYMENTS.md` and `strk20.json` (bonus — the numeric bar is already met, this is now
   pure upside for the "real product demo" story). If it fails identically: you have your answer,
   move to §6 (demo video, README) with the numeric bar already secured.
5. Task list (check `TaskList` for live state):
   - #1 Land a claim/redeem pool transaction — **completed**
   - #2 Land a compute_and_invoke transaction against Velum — **in_progress**, this is §3
   - #3 Verify strk20.json meets the 3-verified-tx / demo / contract bar — **done, see §1**
   - #4 Record a demo video — **pending, nothing exists yet, real gap**
   - #5 Fix README's contradictory headline vs Roadmap section — pending
   - #6 Fix messed-up UI — pending, deferred early in a prior session; `SkyBackdrop.tsx` + 4 cloud
     PNGs were uncommitted at that session's start (check `git status`, may still be sitting there)

---

## 5 · Infra: the local proxies (read this before running ANY script)

This network has two independent problems that make direct RPC calls fail:
1. Intermittent `rustls BadRecordMac` TLS failures against some HTTPS RPC/service hosts.
2. `rpc.starknet.lava.build` is **discontinued as of Sep 7, 2026** and answers everything with
   `"This endpoint has been discontinued."` The mainnet RPC is now
   `https://api.cartridge.gg/x/starknet/mainnet` (spec 0.10.2, which `starknet@10.0.2` supports).
   The old WAF/User-Agent problem it had is moot. See `docs/SPIKE.md` for the endpoints ruled out.

Both are worked around by `~/Projects/Inertia/projects/glasshouse/tools/rpcproxy.py`, a plain-HTTP
local proxy (patched to: preserve request path for REST upstreams, forward auth headers like
`x-paymaster-api-key`, spoof a browser UA, skip forwarding `Accept-Encoding` so it doesn't relay
gzipped garbage). **These proxies die between chat turns/sessions — always verify and restart
before running any script:**

```bash
for p in 8547 8548 8549 8550; do
  printf "port %s: " "$p"
  timeout 3 curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:$p \
    -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"starknet_specVersion","params":[],"id":1}'
done
```
(8549/discovery legitimately 404s on this probe — it's a REST service, not JSON-RPC; that's fine.
8547/8548/8550 should all return 200.)

Restart whichever are down:
```bash
nohup python3 ~/Projects/Inertia/projects/glasshouse/tools/rpcproxy.py --port 8547 --upstream https://api.cartridge.gg/x/starknet/mainnet > /tmp/proxy_rpc.log 2>&1 &
nohup python3 ~/Projects/Inertia/projects/glasshouse/tools/rpcproxy.py --port 8548 --upstream https://transaction-prover.alpha-mainnet.sw-dev.io > /tmp/proxy_prover.log 2>&1 &
nohup python3 ~/Projects/Inertia/projects/glasshouse/tools/rpcproxy.py --port 8549 --upstream https://discovery-service.alpha-mainnet.sw-dev.io > /tmp/proxy_discovery.log 2>&1 &
nohup python3 ~/Projects/Inertia/projects/glasshouse/tools/rpcproxy.py --port 8550 --upstream https://starknet.paymaster.avnu.fi > /tmp/proxy_avnu.log 2>&1 &
sleep 1
```

`.env.local` already points `MAINNET_NODE_URL`, `MAINNET_PROVING_SERVICE_URL`,
`MAINNET_DISCOVERY_URL`, `AVNU_PAYMASTER_URL` at `http://127.0.0.1:854{7,8,9,0}` — no need to edit
it again, just keep the proxies alive.

---

## 6 · Running scripts — the pattern

Every script (`shield.ts`, `redeem.ts`, `claim.ts`, the `probe_*.ts` files) takes ~30-90s (proving
+ AVNU round trip, or less for the free-simulate probes) and should be run backgrounded and
polled, not foregrounded with a long timeout:

```bash
cd ~/Projects/Inertia/projects/velum
node --experimental-strip-types --env-file=.env.local scripts/claim.ts > /tmp/out.log 2>&1 &
echo $! > /tmp/out.pid
```
then
```bash
PID=$(cat /tmp/out.pid)
until ! kill -0 "$PID" 2>/dev/null; do sleep 5; done
cat /tmp/out.log
```

**Do not use `sleep <N>; cat ...` directly** — the harness blocks long bare sleeps. Use the
poll-until-process-exits pattern above (or `Monitor` with an until-loop).

**On "why does this log look truncated/deduped":** tool output display sometimes collapses
repeated identical text across messages. If a log looks suspiciously short, re-`cat`/`Read` with a
unique marker line, or `python3 -c "print(open(...).read())"`.

Remaining lower-priority open items, not touched this session:
- **Demo video** — nothing exists yet, real gap.
- **README** — contradictory headline vs. Roadmap section, needs a pass.
- **UI** — `SkyBackdrop.tsx` + cloud PNGs were sitting uncommitted from an earlier session,
  deliberately deferred until the engine worked; check `git status` in the frontend.

---

## 7 · Everything already fixed this session, for context (don't redo)

- **`scripts/shield.ts`** — originally silently not submitting anything (SDK's `execute()` only
  proves, doesn't broadcast); fixed to submit via an AVNU paymaster (`CorePrivateTransfersProver` +
  `SdkWallet` + `AvnuPaymaster` — plain `account.execute()` can't carry the pool's required custom
  `tx_info.proof_facts` field). **A real bug remains in it, found but not yet fixed:** it
  *unconditionally* deposits `amount + feeAmount` on every run, correct only for the very first
  shield (no pre-existing private balance to draw the fee from). On the top-up run this session it
  debited 9 STRK gross for an intended 3 STRK top-up (3 + 6 protocol fee), because it didn't check
  whether an existing private balance could already cover the fee. **Before running shield.ts again
  for a top-up, either fix this check first, or manually account for the fee being added on top of
  whatever amount you pass.**
- **`scripts/redeem.ts`** — needs a small positive surplus (not exact net-zero) so the compiler
  auto-creates a change note, which is what provides `WriteOnce`/replay protection
  (`privacy.cairo:267-309` — only `WriteOnce` sets `has_replay_protection`).
- **`contracts/scripts/deploy.mjs`** — replaces `sncast declare`/`deploy` entirely. `sncast` has an
  unavoidable internal probe against a `"pre_confirmed"`/`"pending"` block_id this network's RPC
  backend doesn't support (only `"latest"` works) — every sncast attempt failed `Invalid block id`
  regardless of overrides. `deploy.mjs` is a `starknet.js`-direct script forcing
  `blockIdentifier: "latest"` on every internal call. Real, permanent fix — reuse for any future
  contract changes, don't go back to sncast.
- **`glasshouse/tools/rpcproxy.py`** (shared) — three bugs fixed: didn't preserve request path
  (broke REST upstreams), didn't forward auth headers (broke AVNU's API key), forwarded
  `Accept-Encoding` it can't decompress (returned gzip garbage as if it were JSON).
- The funded account address `0x06b7E893...FE108D` pointed at early in an earlier session turned
  out to be a **different** wallet (likely 2FA/guardian Argent account) than the one keys exist
  for — verified real (77 STRK) but not ours to sign for. Left alone. Current signing account
  (§2) is a separate, dedicated one derived from a key in `.env.local`, funded directly by the
  user (20 STRK initially, 30+ STRK more before the contract declare, since declaring cost
  ~24-36 STRK in gas).

---

## 8 · House rules that apply here (from CLAUDE.md / constitution)

- No AI/Claude watermark anywhere public — commits, PR bodies, issues, comments, submission text.
- Commit identity for this project: `jadonamite <jadonamite@gmail.com>` (Inertia/hackathon work
  under the jadonamite account, per `specs/velum/plan.md` header).
- `docs/DEPLOYMENTS.md` and `strk20.json` are the source of truth for "what's actually landed" —
  keep both updated the moment something lands, verified on-chain (check `execution_status` /
  `finality_status` via `starknet_getTransactionReceipt`, don't trust a script's own success
  message alone — the very first `shield.ts` run once printed "shielded" while `transaction_hash`
  was literally `undefined` and nothing had actually broadcast).
