/**
 * Payer route. A payer records an attestation against a recipient tag — never an address, so
 * paying someone through Velum teaches the payer nothing new about them (FR-014).
 */
export default function PayerPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Record a payment</h1>
      <p className="text-[var(--color-mist)]">
        Route shell. Attestations attach here once the channel derivation is wired.
      </p>
    </main>
  );
}
