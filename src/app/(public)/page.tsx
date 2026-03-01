import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LineChart,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ContactForm } from "@/components/landing/ContactForm";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { HomePageLoader } from "@/components/landing/HomePageLoader";
import { LiveActivityToasts } from "@/components/landing/LiveActivityToasts";
import { AboutStatsStrip } from "@/components/landing/AboutStatsStrip";
import { PlansSection } from "@/components/landing/PlansSection";
import { ScrollFadeIn } from "@/components/landing/ScrollFadeIn";
import { SupportedPaymentMethods } from "@/components/landing/SupportedPaymentMethods";
import { CoinConverter } from "@/components/market/CoinConverter";
import { TradingViewAdvancedChart } from "@/components/market/TradingViewAdvancedChart";
import { TradingViewTickerTape } from "@/components/market/TradingViewTickerTape";
import { buttonStyles } from "@/components/ui/button";

const services: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Automated Portfolio Allocation",
    description: "Balance risk and growth with strategy-driven allocation for digital assets.",
    icon: Wallet,
  },
  {
    title: "Risk Intelligence",
    description: "Real-time analytics to monitor volatility, market exposure, and downside alerts.",
    icon: ShieldCheck,
  },
  {
    title: "Secure Wallet Integration",
    description: "Connect your wallets with secure workflows designed for long-term investors.",
    icon: LineChart,
  },
  {
    title: "Performance Reporting",
    description: "Track gains, drawdowns, and monthly insights in one clean dashboard view.",
    icon: BarChart3,
  },
];

const faqs = [
  {
    question: "Is Accelixy suitable for beginners?",
    answer:
      "Yes. Accelixy is designed with guided plans, clear analytics, and educational insights for all experience levels.",
  },
  {
    question: "Can I change plans later?",
    answer: "You can upgrade or downgrade your plan at any time from your account dashboard.",
  },
  {
    question: "How is my account secured?",
    answer:
      "We use encrypted connections, secure authentication workflows, and monitoring to protect account access.",
  },
];

export default function LandingPage() {
  return (
    <HomePageLoader>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        <main>
          <section id="home">
            <HeroCarousel />
          </section>

          <ScrollFadeIn>
            <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
              <TradingViewTickerTape />
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <section id="about" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-semibold md:text-3xl">About Us</h2>
                  <p className="mt-4 max-w-3xl text-muted">
                    Accelixy is a crypto mining company using advanced hardware and mining algorithms to validate and secure blockchain transactions. By supporting networks like Bitcoin and Ethereum, we contribute to stability, transparency, and trusted transaction processing across major digital assets.
                  </p>
                  <p className="mt-4 max-w-3xl text-muted">
                    Our operations are positioned for reliable, cost-efficient power and improved energy sustainability, including renewable integration where possible. Beyond mining, Accelixy also builds diversified digital-asset portfolios, combining market analysis and risk management to pursue long-term growth across established coins and emerging opportunities.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/about" className={buttonStyles("gradient")}>
                      Read More
                    </Link>
                    <a
                      href="https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/accelixy-cert.png"
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles("ghost")}
                    >
                      Certificate
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
                    quality={55}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <AboutStatsStrip />
          </ScrollFadeIn>

          <ScrollFadeIn>
            <section id="services" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
              <h2 className="text-center text-2xl font-semibold md:text-3xl">Services</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <article key={service.title} className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex justify-center">
                      <div className="inline-flex rounded-lg bg-linear-to-r from-primaryGradientStart to-primaryGradientEnd p-2.5">
                        <service.icon className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                    <h3 className="text-center text-lg font-semibold">{service.title}</h3>
                    <p className="mt-2 text-center text-sm text-muted">{service.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <section className="mx-auto w-full max-w-6xl px-4 pb-14 md:px-6">
              <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="grid items-center gap-6 md:grid-cols-2">
                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    <Image
                      src="https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/deposit-crypto.svg"
                      alt="Deposit crypto easily from exchanges"
                      width={1200}
                      height={900}
                      unoptimized
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold md:text-3xl">Deposit crypto easily from exchanges</h3>
                    <p className="mt-4 text-muted">
                      Take control of your crypto. Avoid complicated steps and deposit directly to your wallet using assets like Bitcoin and USDT.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <PlansSection />
          </ScrollFadeIn>

          <ScrollFadeIn>
            <section className="mx-auto w-full max-w-6xl px-4 pb-14 md:px-6">
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      How To Get Started
                    </p>
                    <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
                      We have some easy steps!
                    </h2>
                    <p className="mt-4 text-muted">
                      Kickstart your investment journey and start growing your portfolio with these easy steps.
                    </p>

                    <div className="mt-8 space-y-6">
                      <article className="rounded-xl border border-border bg-background p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-primary">Create Account</h3>
                            <p className="mt-2 text-muted">
                              Register an account by filling in the required details and your account will get approved in no time.
                            </p>
                          </div>
                          <span className="text-3xl font-bold text-primary/60">01</span>
                        </div>
                      </article>

                      <article className="rounded-xl border border-border bg-background p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-primary">Purchase Investment Plan</h3>
                            <p className="mt-2 text-muted">
                              Select an investment plan that best suits your portfolio goals and risk profile.
                            </p>
                          </div>
                          <span className="text-3xl font-bold text-primary/60">02</span>
                        </div>
                      </article>

                      <article className="rounded-xl border border-border bg-background p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-primary">Get Profit</h3>
                            <p className="mt-2 text-muted">
                              Track performance from your dashboard and receive returns based on your selected plan cycle.
                            </p>
                          </div>
                          <span className="text-3xl font-bold text-primary/60">03</span>
                        </div>
                      </article>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    <Image
                      src="https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/get-started.png"
                      alt="How to get started with Accelixy"
                      width={900}
                      height={1100}
                      unoptimized
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <section id="converter" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Market Tools</h2>
              <p className="mt-3 max-w-3xl text-muted">
                Convert coins instantly using live CoinGecko market rates.
              </p>
              <div className="mt-6">
                <CoinConverter />
              </div>
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <section id="live-chart" className="mx-auto w-full max-w-6xl px-4 pb-14 md:px-6">
              <TradingViewAdvancedChart />
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <section id="faq" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Faq</h2>
              <div className="mt-6 space-y-3">
                {faqs.map((item) => (
                  <details key={item.question} className="rounded-lg border border-border bg-card p-4">
                    <summary className="cursor-pointer list-none font-medium">{item.question}</summary>
                    <p className="mt-3 text-sm text-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <section id="terms" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Terms of services</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>Investing carries risk and does not guarantee profit.</li>
                <li>Users are responsible for their account credentials and access security.</li>
                <li>Service plans are billed monthly and can be changed at any billing cycle.</li>
                <li>Platform features may evolve as market and compliance requirements change.</li>
              </ul>
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <section id="contact" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Contact</h2>
              <ContactForm />
            </section>
          </ScrollFadeIn>

          <ScrollFadeIn>
            <SupportedPaymentMethods />
          </ScrollFadeIn>
        </main>

        <footer className="border-t border-border py-6 text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} Accelixy. All rights reserved.</p>
        </footer>

        <LiveActivityToasts />
      </div>
    </HomePageLoader>
  );
}
