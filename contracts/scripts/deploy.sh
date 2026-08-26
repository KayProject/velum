#!/usr/bin/env bash
# Deploy the Velum contract.
#
#   ./scripts/deploy.sh <network> <pool_address>
#
# <network> is an sncast account profile name (see `sncast account list`), not a chain name — the
# chain follows from whichever RPC that profile points at. The pool address is an argument on
# purpose: it is the one value that differs between Sepolia and mainnet, and hardcoding it is how a
# mainnet build ends up talking to a testnet pool.

set -euo pipefail

if [[ $# -ne 2 ]]; then
    echo "usage: $0 <account-profile> <pool-address>" >&2
    exit 2
fi

ACCOUNT="$1"
POOL="$2"
CONTRACT="Velum"

if [[ ! "$POOL" =~ ^0x[0-9a-fA-F]{1,64}$ ]]; then
    echo "pool address must be a hex felt, got: $POOL" >&2
    exit 2
fi

cd "$(dirname "$0")/.."

echo "==> building"
scarb build

echo "==> declaring $CONTRACT"
# A re-declare of an unchanged class is not an error worth stopping for; the class hash is already
# on chain and that is the outcome we wanted.
DECLARE_OUT=$(sncast --account "$ACCOUNT" declare --contract-name "$CONTRACT" 2>&1 || true)
echo "$DECLARE_OUT"

CLASS_HASH=$(grep -oE 'class_hash: *0x[0-9a-fA-F]+' <<<"$DECLARE_OUT" | head -1 | grep -oE '0x[0-9a-fA-F]+' || true)
if [[ -z "$CLASS_HASH" ]]; then
    CLASS_HASH=$(grep -oE '0x[0-9a-fA-F]{60,}' <<<"$DECLARE_OUT" | head -1 || true)
fi
if [[ -z "$CLASS_HASH" ]]; then
    echo "could not read a class hash out of the declare output" >&2
    exit 1
fi
echo "==> class hash: $CLASS_HASH"

echo "==> deploying with pool=$POOL"
sncast --account "$ACCOUNT" deploy --class-hash "$CLASS_HASH" --constructor-calldata "$POOL"

echo
echo "Record the address in docs/DEPLOYMENTS.md and set <NETWORK>_VELUM_ADDRESS in .env"
