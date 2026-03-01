import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { buttonStyles } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Rules</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Rules &amp; Agreements</h1>

          <div className="mt-6 space-y-5 text-muted">
            <p>
              You agree to be of legal age in your country to use this platform. In all cases,
              the minimum age requirement is 18 years.
            </p>

            <p>
              Accelixy services are available only to registered and approved members. Platform
              use is restricted to users who create an account directly or users invited through
              platform referral features. Every deposit is treated as a private transaction between
              Accelixy and the member.
            </p>

            <p>
              As a private platform, Accelixy does not operate as a licensed bank, broker-dealer,
              or securities firm. Accounts are not FDIC insured. All information provided on this
              website is for informational and educational purposes only and should not be treated
              as financial advice.
            </p>

            <p>
              You agree that all information, communications, and materials from Accelixy are
              private and must be handled confidentially. Content on this site is not intended as
              a public solicitation where such offers are unlawful.
            </p>

            <p>
              Data provided by members is used for platform operations and compliance purposes.
              While Accelixy applies security and protection standards, no system can guarantee
              absolute protection against all technical risks.
            </p>

            <p>
              You agree to hold platform principals and members harmless from liabilities arising
              from market volatility, personal account decisions, or misuse of platform services.
              You invest at your own risk, and past performance does not guarantee future results.
            </p>

            <p>
              Accelixy reserves the right to update platform rules, commission structures, and
              service rates at any time when required for security, legal, or operational reasons.
              You are responsible for reviewing the latest terms.
            </p>

            <p>
              Accelixy is not responsible for damages, losses, or costs resulting from violation
              of these terms or misuse of the platform. You agree to comply with all applicable
              local, national, and international laws.
            </p>

            <p>
              SPAM, abusive promotion, and any form of unsolicited commercial activity are strictly
              prohibited. Violations may lead to immediate and permanent account restrictions.
            </p>

            <p>
              Accelixy reserves the right to accept, reject, or terminate membership at its sole
              discretion, where permitted by law.
            </p>

            <p>
              If you do not agree with these Rules &amp; Agreements, please do not use this platform.
            </p>
          </div>

          <div className="mt-8">
            <Link href="/register" className={buttonStyles("gradient")}>
              Back to Signup
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
