# Getting a shielded mainnet balance

This is the one thing nobody else can do for you, and everything that scores depends on it. Read
the whole page once before you start — step 3 costs real money and step 4 is irreversible.

**Time:** about 40 minutes, most of it waiting on a bridge or an exchange withdrawal.
**Cost:** the deposit itself (yours, still yours afterwards) plus roughly 7–8 STRK in fees.

---

## Before you start: why there is no button

You would expect to install a wallet, click *Shield*, and be done. That does not exist yet:

- `strk20.starknet.io/app` has a shield control, but its wallet integration was removed —
  `app-shield.jsx:105-107` says so in the source.
- No mainnet wallet implements the STRK20 wallet API. Braavos answers `Not implemented` to every
  STRK20 method. Ready, Xverse and Keplr are the same.

So the wallet's job here is small: **hold STRK and give you a private key.** The shielding itself
runs through `scripts/shield.ts`, which drives the SDK directly.

---

## Step 1 — Create a Starknet account

Use **Ready** (the wallet formerly called Argent X) — it is the one whose key export is least
buried.

1. Go to **https://www.ready.co** and install the browser extension. Check the URL character by
   character before installing; wallet phishing clones rank well in search results.
2. Open it, choose **Create a new wallet**, and set a password.
3. It shows you a **12-word recovery phrase**. Write it on paper. Not a screenshot, not a note
   app, not a message to yourself. Anyone with those 12 words owns everything in the account
   forever.
4. Confirm the phrase when it asks.
5. Check the network selector at the top says **Mainnet**.

Copy your account address — it starts `0x0` and is 65 or 66 characters. You will need it twice.

> A Starknet account is a contract, and it does not exist on chain until its first transaction.
> Ready shows the address immediately and deploys it when you first send something. This is normal
> and costs a few STRK the first time.

## Step 2 — Get STRK into it

**How much:** you need your deposit, plus a **6 STRK** protocol fee the pool charges on every
call, plus gas. **20 STRK** is a comfortable first number — enough to shield something real,
small enough that a mistake is a lesson rather than a loss.

Two ways in:

**From an exchange (simpler).** Bybit, OKX, KuCoin and Gate all list STRK and can withdraw
**directly to the Starknet network**. Buy STRK, then withdraw — and on the withdrawal screen pick
**Starknet** as the network, not Ethereum. Sending STRK over Ethereum to a Starknet address loses
it. Paste your address from step 1.

**From Ethereum (if your STRK is already on L1).** Use the official bridge at
**https://starkgate.starknet.io**, connect both wallets, send STRK across. It takes a few hours.

Wait until Ready shows the balance before continuing.

## Step 3 — Export the private key

The script signs transactions, so it needs the key. There is no way around this and no version of
it where the key lives somewhere clever.

In Ready: **Settings → your account → Export private key**. It asks for your password. Copy the
key.

**Do not paste this key into a chat with me, into an AI tool, into a website, or into any file
that is not the one named below.** I have not seen it and do not need to. If it ever leaks,
everything in that account is gone within minutes — Starknet addresses are watched by bots.

## Step 4 — Put your details in `.env.local`

In `~/Projects/Inertia/projects/velum`, create a file called **`.env.local`**. It is gitignored, so
it cannot be committed by accident.

```bash
cp .env.example .env.local
```

Then open `.env.local` and add these three lines at the bottom:

```
VELUM_ACCOUNT_ADDRESS=0x...your address from step 1...
VELUM_ACCOUNT_PRIVATE_KEY=0x...your key from step 3...
VELUM_PASSPHRASE=some-long-sentence-only-you-know
```

`VELUM_PASSPHRASE` is a new thing you invent right now. It derives your **viewing key** — the key
that decrypts your own notes. Salted with your account address, so the same passphrase on a
different account gives a different key.

**Write the passphrase down next to your recovery phrase.** If you lose it, your shielded balance
still exists on chain and is still yours, but you can no longer see it. There is no reset.

The other values in the file — pool address, prover, discovery — are already correct for mainnet.

## Step 5 — Shield

```bash
cd ~/Projects/Inertia/projects/velum
node --experimental-strip-types --env-file=.env.local scripts/shield.ts 20
```

It prints what it is about to do first — network, account, pool, amount, the fee it read from the
pool, and your balance. Read that before it moves on.

Then it does two transactions:

1. **Approve.** Lets the pool pull the deposit *and* the 6 STRK fee. Confirms in a few seconds.
2. **Shield.** Proves and submits. **This takes about 30 seconds and prints nothing while it
   works.** It has not hung — every STRK20 transaction is proved, including a plain deposit, and
   the proving service is doing that now.

It ends with a transaction hash and a Voyager link.

## Step 6 — Keep the hash

That hash touches the pool, so it is one of the **three mainnet transactions** the sprint needs in
`strk20.json`. Send it to me, or paste it straight into `strk20.json`:

```json
{ "transactions": ["0x...your hash..."], "contracts": [], "demo_video": "", "demo_url": "" }
```

The hub re-reads the repo every 30 minutes and your row updates on its own.

---

## When it goes wrong

| What you see | What it is |
|---|---|
| `short by N STRK` | Deposit + 6 STRK fee exceeds your balance. Send more, or shield less. |
| Hangs ~30s at "proving" | Working as intended. Wait. |
| `BadRecordMac` / TLS error | Your network, not the code. Start the local proxy on `:8547` and set `MAINNET_NODE_URL=http://127.0.0.1:8547`. |
| Approve succeeds, shield reverts | Almost always the fee allowance. The script approves deposit + fee together; if you approved by hand earlier, re-run it. |
| `Contract not found` | The account contract has not been deployed yet. Send any small transaction from Ready first, then re-run. |

## The rules, restated

- The recovery phrase and the private key never leave your machine, never enter a chat, never get
  committed. `.env.local` is gitignored — keep it that way.
- The passphrase is not recoverable. Write it down.
- Nothing here needs to touch anything outside this project. No other wallet, no other key.
