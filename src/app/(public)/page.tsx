import Image from "next/image";
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
import { LiveActivityToasts } from "@/components/landing/LiveActivityToasts";
import { PlansSection } from "@/components/landing/PlansSection";
import { CoinConverter } from "@/components/market/CoinConverter";
import { TradingViewTickerTape } from "@/components/market/TradingViewTickerTape";

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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <section id="home">
          <HeroCarousel />
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6">
          <TradingViewTickerTape />
        </section>

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
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Image
                src="https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/Hero%20section/About-us.png"
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

        <PlansSection />

        <section id="converter" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <h2 className="text-2xl font-semibold md:text-3xl">Market Tools</h2>
          <p className="mt-3 max-w-3xl text-muted">
            Convert coins instantly using live CoinGecko market rates.
          </p>
          <div className="mt-6">
            <CoinConverter />
          </div>
        </section>

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

        <section id="terms" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <h2 className="text-2xl font-semibold md:text-3xl">Terms of services</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Investing carries risk and does not guarantee profit.</li>
            <li>Users are responsible for their account credentials and access security.</li>
            <li>Service plans are billed monthly and can be changed at any billing cycle.</li>
            <li>Platform features may evolve as market and compliance requirements change.</li>
          </ul>
        </section>

        <section id="contact" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <h2 className="text-2xl font-semibold md:text-3xl">Contact</h2>
          <ContactForm />
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} Accelixy. All rights reserved.</p>
      </footer>

      <LiveActivityToasts />
    </div>
  );
}
