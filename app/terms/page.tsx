import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const metadata = {
  title: "Terms & Conditions — Velum",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#181818] flex flex-col justify-between">
      <Navbar />
      <main className="w-full">
        <div className="mx-auto max-w-3xl px-6 sm:px-10 py-16 sm:py-24">
          <span className="font-mono text-xs text-[#858585]">[ legal ]</span>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm text-[#686868]">Last updated: September 2026</p>

          <div className="mt-10 space-y-10 text-sm leading-relaxed text-[#3f3f46]">
            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">1. What Velum is</h2>
              <p>
                Velum is a zero-knowledge proof layer built on Starknet&apos;s STRK20 privacy pool.
                It lets an earner generate a time-limited claim showing that qualifying income from
                a payer exceeded a stated threshold, without disclosing the underlying payments,
                balances, or counterparties. Velum is provided as-is, in active development, and is
                not a bank, custodian, payments processor, or licensed financial institution.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">2. No custody, no financial advice</h2>
              <p>
                Velum never takes custody of funds and never holds a private key on your behalf.
                Every claim is generated locally from your own viewing key. Nothing on this site is
                financial, legal, tax, or investment advice, and a generated claim is not a
                guarantee accepted by any specific landlord, lender, insurer, or visa authority —
                acceptance is entirely at the discretion of the party you share it with.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">3. Your responsibilities</h2>
              <p>
                You are solely responsible for safeguarding your viewing key and passphrase — Velum
                has no way to recover them and no way to see your private balances. You agree not
                to use Velum to fabricate, misrepresent, or launder the origin of funds, and not to
                attempt to interfere with the STRK20 pool, its contracts, or other users&apos; claims.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">4. On-chain finality</h2>
              <p>
                Actions that touch the Starknet mainnet — shielding, redeeming, attesting, and
                claiming — are irreversible once confirmed on-chain. Velum is not able to reverse,
                refund, or edit a transaction after it has been accepted by the network.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">5. No warranty</h2>
              <p>
                Velum is experimental software offered without warranty of any kind, express or
                implied, including fitness for a particular purpose. To the fullest extent
                permitted by law, Velum and its builders are not liable for any loss arising from
                use of the site, the contracts, or a claim generated through it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">6. Changes</h2>
              <p>
                These terms may be updated as the product evolves. Continued use of Velum after a
                change is posted constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">7. Contact</h2>
              <p>
                Questions about these terms can be sent to{" "}
                <a href="mailto:contact@velum.cash" className="text-[#2563eb] hover:underline">
                  contact@velum.cash
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
