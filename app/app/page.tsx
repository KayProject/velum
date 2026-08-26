/**
 * Earner route. The generate flow lands here (T031): passphrase held in memory only, payer,
 * window, threshold, verifier code, then one proven transaction.
 */
export default function EarnerPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Generate a claim</h1>
      <p className="text-[var(--color-mist)]">
        Route shell. The claim builder attaches here once the pool client is wired to a wallet.
      </p>
    </main>
  );
}
