import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Accelixy",
  description:
    "Learn about Accelixy's crypto mining operations, diversified digital-asset investment approach, and commitment to security and transparency.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutReadMorePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
        <section className="grid items-start gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">About Accelixy</h1>
            <p className="mt-4 text-muted">
              Accelixy is a crypto mining company using advanced hardware and mining
              algorithms to validate and secure blockchain transactions.
            </p>
            <p className="mt-4 text-muted">
              By supporting major blockchain ecosystems, we help maintain reliability
              and transaction integrity while contributing to long-term network
              stability.
            </p>
            <p className="mt-4 text-muted">
              Our operations are built around performance, power efficiency, and
              practical sustainability. We also develop structured digital-asset
              investment strategies backed by market analysis and risk-aware planning.
            </p>
            <p className="mt-4 text-muted">
              This combined approach allows us to serve both infrastructure and
              portfolio growth goals for users who want a clearer path in the crypto
              market.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/#about" className={buttonStyles("ghost")}>
                Back to Home
              </Link>
              <a
                href="https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/accelixy-cert.png"
                target="_blank"
                rel="noreferrer"
                className={buttonStyles("gradient")}
              >
                View Certificate
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Image
              src="https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/about-us.png"
              alt="About Accelixy"
              width={1200}
              height={900}
              unoptimized
              className="h-auto w-full object-cover"
            />
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-2xl font-semibold md:text-3xl">Accelixy Investment Operations</h2>
          <p className="mt-4 text-muted">
            In addition to its mining operations, Accelixy also operates as an investment
            company, actively engaging in the buying, selling, and holding of
            cryptocurrencies. Leveraging deep market expertise, the company identifies
            promising investment opportunities and manages portfolios to maximize returns
            while mitigating risk. Accelixy&apos;s investment strategies follow a diversified
            approach, balancing established cryptocurrencies with emerging projects to
            capture value across multiple segments of the crypto ecosystem.
          </p>
          <p className="mt-4 text-muted">
            The company is supported by experienced professionals with strong knowledge of
            blockchain technology, financial markets, and risk management. This expertise
            helps Accelixy navigate the complexity and volatility of the cryptocurrency
            landscape, adapting strategy to take advantage of evolving market trends and
            opportunities.
          </p>
          <p className="mt-4 text-muted">
            Accelixy&apos;s commitment to transparency, security, and regulatory compliance
            positions it as a trusted partner for both individual and institutional
            investors. The company applies robust controls to protect digital assets and
            client information from cyber threats and unauthorized access.
          </p>
          <p className="mt-4 text-muted">
            Furthermore, Accelixy adheres to applicable regulations and compliance standards
            in each jurisdiction where it operates. This commitment supports a more stable
            and secure investment environment and contributes to broader institutional
            adoption of cryptocurrencies.
          </p>
          <p className="mt-4 text-muted">
            Through its mining and investment operations, Accelixy contributes to the growth
            and maturation of the crypto industry. By providing liquidity, stability, and
            responsible investment practices, the company helps build confidence and trust,
            supporting mainstream adoption of cryptocurrencies as a legitimate asset class.
          </p>
          <p className="mt-4 text-muted">
            In summary, Accelixy is a crypto mining and investment company that combines
            mining operations with a comprehensive investment strategy. With a focus on
            advanced technology, sustainable practices, and regulatory compliance, Accelixy
            aims to deliver attractive returns while promoting long-term growth and
            acceptance of cryptocurrencies.
          </p>
        </section>

        <section className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-1 w-full bg-gradient-to-r from-primaryGradientStart to-primaryGradientEnd" />
          <div className="px-6 py-10 text-center md:px-10">
            <h2 className="text-3xl font-semibold md:text-5xl">
              ACCELIXY
              <span className="block bg-gradient-to-r from-primaryGradientStart to-primaryGradientEnd bg-clip-text text-transparent">
                DIGITAL ASSET COMPANY
              </span>
            </h2>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted">
              Mining infrastructure, investment intelligence, and long-term crypto growth
            </p>

            <p className="mx-auto mt-8 max-w-4xl text-base leading-8 text-muted">
              Accelixy combines reliable blockchain validation with disciplined portfolio strategy.
              We focus on secure operations, transparent reporting, and risk-aware execution so users
              can build exposure to digital assets with more confidence. From mining-backed infrastructure
              to structured investment planning, our mission is to deliver practical tools that support
              sustainable growth in fast-moving crypto markets.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={{
                  pathname: "/",
                  hash: "services",
                }}
                className={buttonStyles("ghost")}
              >
                View Services
              </Link>
              <span className="px-1 text-muted">or</span>
              <Link href="/register" className={buttonStyles("gradient")}>
                Register Now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
