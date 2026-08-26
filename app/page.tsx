import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <h1 className="text-5xl font-semibold tracking-tight">Velum</h1>
        <p className="mt-4 text-lg text-[var(--color-mist)]">
          A landlord wants to know you clear ₦4.2m a quarter. Today you answer by handing over
          bank statements — every client, every amount, every date, for one yes-or-no question.
        </p>
        <p className="mt-4 text-lg text-[var(--color-mist)]">
          Velum answers the question and nothing else. The sum is computed inside a proof; what
          lands on chain is a commitment, a verifier binding, and an expiry.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/app"
          className="rounded-lg bg-[var(--color-signal)] px-5 py-3 font-medium text-[var(--color-ink)]"
        >
          I earned it
        </Link>
        <Link
          href="/payer"
          className="rounded-lg border border-[var(--color-edge)] px-5 py-3 font-medium"
        >
          I paid someone
        </Link>
      </div>

      <p className="text-sm text-[var(--color-mist)]">
        Verifiers do not need this page, an account, or a wallet — they open the link they were
        given.
      </p>
    </main>
  );
}
