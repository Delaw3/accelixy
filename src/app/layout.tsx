import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalSupportWidgets } from "@/components/layout/GlobalSupportWidgets";
import { AppProviders } from "@/components/providers/app-providers";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = getSiteUrl();
const metadataBase = (() => {
  try {
    return new URL(appUrl);
  } catch {
    return new URL("https://accelixy.com");
  }
})();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Accelixy | Digital Asset Investment Platform",
    template: "%s | Accelixy",
  },
  description:
    "Accelixy is a digital asset investment platform with structured plans, transparent tracking, and secure account operations.",
  keywords: [
    "crypto investment platform",
    "digital asset portfolio",
    "cryptocurrency investment plans",
    "bitcoin investment",
    "altcoin portfolio tracking",
    "Accelixy",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Accelixy",
    title: "Accelixy | Digital Asset Investment Platform",
    description:
      "Structured digital asset plans, transparent performance tracking, and secure account operations.",
    images: [
      {
        url: "/brand/logo.png",
        width: 1200,
        height: 630,
        alt: "Accelixy digital asset platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Accelixy | Digital Asset Investment Platform",
    description:
      "Structured digital asset plans, transparent performance tracking, and secure account operations.",
    images: ["/brand/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/brand/logo.png",
    shortcut: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <AppProviders>{children}</AppProviders>
        <GlobalSupportWidgets />
      </body>
    </html>
  );
}
