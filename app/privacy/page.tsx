import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const metadata = {
  title: "Privacy Policy — Velum",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[#181818] flex flex-col justify-between">
      <Navbar />
      <main className="w-full">
        <div className="mx-auto max-w-3xl px-6 sm:px-10 py-16 sm:py-24">
          <span className="font-mono text-xs text-[#858585]">[ legal ]</span>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181818]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-[#686868]">Last updated: September 2026</p>

          <div className="mt-10 space-y-10 text-sm leading-relaxed text-[#3f3f46]">
            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">1. Privacy is the product</h2>
              <p>
                Velum exists to help earners disclose less, not more. This policy explains what
                little data touches our systems at all, and it is intentionally short — because the
                whole point of Velum is that your income, balances, and transaction history never
                have to leave your own browser to prove a claim.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">2. What never leaves your device</h2>
              <p>
                Your viewing key, passphrase, and private balance are used only inside your local
                browser session to derive your identity anchor and construct a proof. Velum has no
                server that receives, stores, or logs these values, and no backend database of
                users, incomes, or claims.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">3. What is public by design</h2>
              <p>
                A generated claim&apos;s cryptographic receipt — a claim ID, a verifier-bound
                challenge hash, and an expiry — is written to the Starknet blockchain, which is a
                public ledger. This receipt reveals that a threshold was met; it does not reveal the
                amount, the payer&apos;s identity, or any other payment in your history. Public
                blockchain data is, by nature, permanent and outside Velum&apos;s control to delete.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">4. Analytics and cookies</h2>
              <p>
                Velum does not run third-party advertising trackers. Standard hosting-level logs
                (such as those kept automatically by our deployment provider for security and abuse
                prevention) may briefly record IP addresses and request metadata; these are not
                linked to any wallet, claim, or income data.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">5. If you contact us</h2>
              <p>
                If you email{" "}
                <a href="mailto:contact@velum.cash" className="text-[#2563eb] hover:underline">
                  contact@velum.cash
                </a>
                , we retain that correspondence only as long as needed to respond and to keep a
                reasonable support record.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-bold text-[#181818] mb-2">6. Changes to this policy</h2>
              <p>
                As Velum&apos;s infrastructure evolves, this policy may be updated to reflect it.
                Material changes will be reflected in the "Last updated" date above.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
