# Day-0 spike — what the mainnet actually offers

**Run** Aug 26, 2026. Sources: the sprint's own `docs/MAINNET-DAY-0.md`, the pool's Cairo and TS
source, and the sprint repo's open issues. Nothing here is from an aggregator.

## Verified mainnet values

```
CHAIN_ID     = SN_MAIN  (0x534e5f4d41494e)
RPC_URL      = https://rpc.starknet.lava.build
POOL_ADDRESS = 0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a
```

Pool is **V2** (`get_version` → `3288624` = ASCII `"2.0"`) and charges **6 STRK per transaction**,
not 4, and per transaction rather than per operation (sprint issue #156). Reads work today: the
published `PrivacyPoolABI` plus a plain `starknet.js` `Contract` satisfies the SDK's
`PoolContractInterface`.

## ⛔ The blocker, and it is the one the plan named

**There is no published mainnet proving service URL, and every pool write needs a proof.**

The Day-0 doc states it outright: *"the mainnet proving service URL is not published here yet… if
your design needs the SDK route on mainnet, open an issue and say so — that's the one blocker a
team cannot work around on its own. Don't guess endpoints."* Five open issues ask for it — #121,
#124, #135, #147, #158 — the oldest from Aug 20. **All still open and unanswered as of Aug 26.**

The doc's own workaround is the Wallet API route: the *user's* privacy-enabled wallet reaches the
proving service itself, so the dapp needs only an RPC URL. Two things kill it for Velum.

1. **No mainnet wallet implements the STRK20 methods yet.** Probed by another team against Braavos
   on mainnet (account class `0x3957f9f…759bf8a`, `get_version` `001.002.000`):
   `wallet_supportedWalletApi` → failed, `wallet_strk20Balances` → **Not implemented**. There is no
   published list of wallets that do implement them.
2. **Even a compliant wallet cannot express Velum's central action.** `compute_and_invoke` is a
   **local shim** in the client package, not part of the wallet API:
   *"LOCAL SHIM — remove when `@starknet-io/starknet-types` ships it… a real strk20 wallet gains it
   upstream"* (`client/src/interfaces.ts:14-26`). The wallet route can shield and transfer. It
   cannot hand off to a third-party contract's `privacy_compute`.

So both routes are closed at once: the SDK route on the missing prover URL, the wallet route on
wallet support that does not exist yet — and, for Velum specifically, on an action type that is not
in the wallet API at all.

## What this does and does not kill

**Does not kill:** shielding and private transfers on mainnet through the sprint's own app at
`strk20.starknet.io/app`, viewing-key registration, and every read path. Mainnet pool transactions
are obtainable; they just are not *Velum's* transactions.

**Does kill, until the URL exists:** the claim flow as planned — `UseNote` → `CreateEncNote` →
`ComputeAndInvoke(Velum)` — because Velum constructs that action set itself, which is the SDK route
by definition.

## The way through: run the prover ourselves

The stack is self-hostable from published images. From the protocol README's compatibility matrix:

| Component | Image |
|---|---|
| Transaction prover | `ghcr.io/starkware-libs/starknet-privacy/transaction-prover:PRIVACY-0.14.3-RC.2` |
| Proof interceptor (deposit screening sidecar) | `ghcr.io/starkware-libs/starknet-privacy/proof-interceptor:PRIVACY-0.14.3-RC.2` |
| Discovery service | `ghcr.io/starkware-libs/starknet-privacy/discovery-service:PRIVACY-0.14.3-RC.2` |
| Pathfinder node | `eqlabs/pathfinder:v0.22.7`, with `PATHFINDER_STORAGE_STATE_TRIES=10000` |

The prover is a JSON-RPC service (`starknet_proveTransaction`) and the interceptor is its in-pod
sidecar, called by the prover rather than by clients. The sidecar only matters for **deposits** —
it screens the depositor and returns the signature the pool verifies on chain. Velum's claim
transaction makes no deposit, so screening is not in its path.

The cost is the node. `PATHFINDER_STORAGE_STATE_TRIES=10000` reads as a real Pathfinder mainnet
node serving state tries, not a public RPC endpoint — sync time and disk, on a machine that is not
Jadon's laptop. Whether that is a day or a week is the open question, and it is the question put to
StarkWare in **[sprint issue #204](https://github.com/starkience/strk20-hackathon/issues/204)**
(opened Aug 26, jadonamite), alongside the `compute_and_invoke` finding above.

The docs also name **Ready and Xverse** as privacy-enabled wallets used by teams running their own
prover (`strk20-by-example.org/sdk/proving-config`). Only Braavos has been probed and failed. That
matters for shielding, not for the claim transaction.

## Open, not decided here

- Where the prover and node run, and who pays for them.
- Whether to start the Pathfinder mainnet sync now, in parallel with waiting on #204, so the answer
  arrives into a node that is already warm rather than a cold one.

**Ruled out, Aug 26:** re-architecting onto the shadow-account anonymizer. It buys nothing — no
mainnet wallet implements the STRK20 methods, so that route is shut for the same reason, and it
would have cost the private threshold sum.

---

## RESOLVED — Aug 26, 2026: the mainnet prover exists

Everything above about "no mainnet proving service" is **superseded**. The endpoints are live and
public; they are simply undocumented.

```
PROVING_SERVICE_URL = https://transaction-prover.alpha-mainnet.sw-dev.io
DISCOVERY_URL       = https://discovery-service.alpha-mainnet.sw-dev.io
```

**How they were found.** GitHub code search for `PROVING_SERVICE_URL` / `ProvingServiceProofProvider`
across all of GitHub, not just StarkWare's docs. `starkware-industries/pripay` — StarkWare's own
privacy payments app — proxies the prover through its own server to dodge mixed content, and
`server.js:19-26` names the mainnet hosts in a comment:

> *"Mainnet values: transaction-prover / discovery-service at `.alpha-mainnet.sw-dev.io`
> (override via env when flipping network-config to mainnet)."*

**Both verified reachable, Aug 26:**

| Probe | Result |
|---|---|
| `GET https://transaction-prover.alpha-mainnet.sw-dev.io/` | `405` — alive, POST-only |
| `POST … {"method":"starknet_proveTransaction","params":{}}` | `200` `-32602 "missing field block_id"` — it is the prover |
| `GET https://discovery-service.alpha-mainnet.sw-dev.io/health` | `200` `status OK`, head `13883815`, `lag_secs 5` |
| Cross-check `starknet_blockNumber` on `rpc.starknet.lava.build` | `13883829`, `chainId 0x534e5f4d41494e` — same chain, 14 blocks apart |

Sepolia's discovery reports head `14066205` — a different chain, which rules out a sepolia service
mislabelled as mainnet.

### What this changes

- **Self-hosting is off.** No Pathfinder node, no rented server, no sync wait. Delete that plan.
- **The Wallet API dead end no longer matters.** The SDK route works, so `compute_and_invoke` being
  absent from the wallet API is irrelevant to Velum — we never needed a wallet to reach a prover.
- **Issue #204's first question is answered by us, not to us.** Its second question is moot.

### Two things found on the way that still stand

1. **`strk20.starknet.io/app` cannot shield.** Its own source, `app-shield.jsx:105-107`:
   *"Wallet integration stripped from this branch — the button unchanged. Re-wire on the next branch
   that owns wallet UX."* The Connect Wallet button is a stub. Shielding through StarkWare's front
   end is not possible today — it must be done through the SDK.
2. **Every `execute()` proves, including a plain deposit.** `sdk/src/internal/private-transfers.ts:98`
   calls `provingProvider.prove(...)` on the single path. There is no proof-free shield. This is why
   item 1 matters: with no working front end and no published prover, shielding was impossible for
   anyone outside StarkWare until now.

**Reference point for expectations:** `ToXMon/backerzero-strk20` ran a real `compute_and_invoke`
end-to-end against the sepolia prover and logged **26,794 ms** of proving time for one transaction.
Budget ~30s per private transaction, not milliseconds.

---

## T003 — the real field, counted Aug 26

Counted from the panel's own `projects.json` (the file the hub renders), not from `registry.json`,
because `registry.json` is only the sign-up list — `projects.json` carries what the cron actually
verified.

| | |
|---|---|
| Registered projects | **151** |
| With ≥3 verified mainnet transactions | **22** |
| With any verified transaction | 27 |
| With a demo video | 13 |
| Meeting all three (≥3 txs · video · demo URL) | **6** |

**The real field is six.** Attrition on the mainnet-proof requirement is as brutal as the event
research predicted, and the reason is now clear: until the prover URL above was found, there was no
documented way for anyone outside StarkWare to land a private transaction at all.

`jadonamite/XENIA` (the separately registered entry, with Sam-Rytech) sits at `verified_txs: 0`,
`demo_video: ""`, `status: building`. **Velum is not registered** — no repo, no `registry.json`
entry.

## T004 — network path

The local TLS proxy on `:8547` is **not running and not needed**. All three hosts this project
depends on answer directly over TLS from Jadon's machine:

```
https://rpc.starknet.lava.build                        405
https://transaction-prover.alpha-mainnet.sw-dev.io     405
https://discovery-service.alpha-mainnet.sw-dev.io      404
```

(`405`/`404` on a bare `GET` means alive and POST-only, not broken.)

Keep the proxy as a fallback: the `rustls BadRecordMac` failures that plague forge/cast on this
network can reappear. If an RPC read starts failing intermittently, start the proxy and re-point
before touching the code.
