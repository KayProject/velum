# Deep-search prompt — STRK20 mainnet proving

> **Superseded in large part, Aug 26.** Q1 is answered — the mainnet prover is
> `https://transaction-prover.alpha-mainnet.sw-dev.io`, discovery is
> `https://discovery-service.alpha-mainnet.sw-dev.io`, both verified live. Q2 and Q3 are moot
> (no self-hosting needed). **Q4, Q5 and Q6 are still worth running.** See `SPIKE.md`.

Paste everything below the line into a deep-research tool. It is written to be self-contained.

---

You are researching a specific, narrow infrastructure question. Do not summarise the general
topic. Every claim must carry a URL, a repo path with line numbers, or a quoted message with its
author and date. **If you cannot find something, say "not found" and say where you looked.** A
confident guess is worse than a gap.

## Background you should treat as established

StarkWare shipped **STRK20 / starknet-privacy**, a shielded-balance privacy pool on Starknet.
Source: `github.com/starkware-libs/starknet-privacy`. There is a live mainnet pool at
`0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a`, version 2.0, fee 6 STRK per
transaction. A hackathon ("STRK20 Private Sprint", `github.com/starkience/strk20-hackathon`) runs
to Aug 31, 2026 and requires mainnet deployment.

Every write to the pool must first be proved by a **proving service** exposing the JSON-RPC method
`starknet_proveTransaction`. The SDK reaches it via `ProvingServiceProofProvider(proverUrl, chainId)`.
**No mainnet prover URL appears to be published.** Multiple hackathon issues asking for one
(#121, #124, #135, #147, #158) are open and unanswered as of Aug 26, 2026.

The documented alternative is to let the user's **wallet** hold the prover connection via STRK20
wallet-API methods. Two problems: (a) a Braavos mainnet probe returned *Not implemented* for
`wallet_strk20Balances`; (b) the specific action we need, `compute_and_invoke`, is **not in the
wallet API at all** — in `client/src/interfaces.ts` it is marked a local shim, *"remove when
`@starknet-io/starknet-types` ships it… a real strk20 wallet gains it upstream."*

A third route exists: **self-host** from published images —
`ghcr.io/starkware-libs/starknet-privacy/transaction-prover:PRIVACY-0.14.3-RC.2`,
`…/discovery-service:PRIVACY-0.14.3-RC.2`, alongside `eqlabs/pathfinder:v0.22.7` configured with
`PATHFINDER_STORAGE_STATE_TRIES=10000`.

## The questions, in priority order

**Q1 — Does a reachable mainnet proving endpoint exist, publicly or on request?**
Look for: any hostname ever passed as `PROVING_SERVICE_URL` or `proverUrl` for `SN_MAIN`, in
GitHub code search across all repos (not just StarkWare's), in hackathon participants' committed
`.env.example` / `docker-compose` / CI files, in Discord/Telegram/X messages from StarkWare staff,
in the network traffic of `strk20.starknet.io/app`. State the URL and evidence, or "not found".
Distinguish sepolia endpoints from mainnet ones — do not report a sepolia URL as an answer.

**Q2 — Does the transaction-prover need a full Pathfinder node, or can it read from a public RPC?**
Read the prover's own configuration surface: image env vars, `docker-compose*.yml` in the protocol
repo, any Helm chart or deployment manifest, the Rust/service source if published. Specifically:
*what does it need `PATHFINDER_STORAGE_STATE_TRIES` for, and is that requirement on the prover, the
discovery service, or both?* If it needs Merkle state-trie proofs, name the exact RPC method
(`pathfinder_getProof` or successor) and confirm whether any public Starknet mainnet RPC provider
(Lava, Alchemy, Infura, Blast, Nethermind, Chainstack, dRPC) exposes it. **This is the question
that decides the project's cost.**

**Q3 — What does a Starknet mainnet Pathfinder node with state tries actually cost to run?**
Wanted, with sources dated 2026: current on-disk size of the mainnet database with
`STORAGE_STATE_TRIES=10000` vs pruned; wall-clock sync time from genesis on a given machine spec;
minimum RAM and vCPU that people report actually working; whether a snapshot / fast-sync exists to
skip the initial sync, and where. Then price it on Hetzner, Latitude.sh, OVH, Contabo, AWS, and
DigitalOcean, in USD per month. Prefer operator reports (Pathfinder GitHub issues, Starknet node
operator channels) over vendor marketing.

**Q4 — Which mainnet wallets actually implement the STRK20 wallet API today?**
Test-level detail, not announcements. Ready (formerly Argent X), Xverse, Braavos, Keplr, any other.
For each: does a mainnet build respond to `wallet_strk20Balances` / `wallet_strk20Actions`, which
version shipped it, and — separately — does any of them support `compute_and_invoke`? Cite version
numbers, changelogs, or a reproducible probe. Assume Braavos does not; verify the others.

**Q5 — How are the other teams doing it?**
136 repos are registered for this sprint. Find teams that have landed a **real mainnet pool
write**. For each: link the transaction on Voyager/Starkscan, and find in their repo how they
proved it — a prover URL, a self-hosted compose file, a wallet, or a StarkWare-granted credential.
If nobody has landed one, that is itself the answer and is worth stating plainly with the evidence.

**Q6 — Has StarkWare answered any of this anywhere?**
Sweep beyond GitHub issues: the sprint Discord/Telegram, StarkWare engineers on X, the Starknet
community forum, office-hours recordings, and any FAQ or pinned message. Quote verbatim with date
and author. Note especially any statement about whether self-hosting the prover is sanctioned.

## What a good answer looks like

A short verdict per question — **yes / no / not found** — then the evidence. Then one paragraph:
*given all of it, what is the cheapest path to one proved mainnet transaction before Aug 31, 2026,
and what does it cost in dollars and hours?*

Do not propose redesigning the application. The question is purely how to get a transaction proved.
