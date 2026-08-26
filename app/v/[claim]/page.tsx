/**
 * Verifier route. No wallet, no account, no install — the verifier opens the link and reads one
 * of five answers (T033). The first valid read spends the claim (T034).
 */
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ claim: string }>;
}) {
  const { claim } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Verify a claim</h1>
      <p className="font-mono text-sm break-all text-[var(--color-mist)]">{claim}</p>
      <p className="text-[var(--color-mist)]">
        Route shell. The status read attaches here once Velum is deployed.
      </p>
    </main>
  );
}
