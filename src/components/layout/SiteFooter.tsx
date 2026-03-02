import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-card/60">
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-8 top-8 h-1.5 w-1.5 rounded-full bg-primary/70" />
        <span className="absolute right-12 top-12 h-1 w-1 rounded-full bg-primary/50" />
        <span className="absolute bottom-10 left-1/4 h-1 w-1 rounded-full bg-primary/40" />
        <span className="absolute bottom-8 right-1/3 h-1.5 w-1.5 rounded-full bg-primary/50" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 text-center md:px-6 md:py-12">
        <div className="flex justify-center">
          <Logo width={210} height={62} className="scale-75 sm:scale-100" />
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-muted md:text-[1.05rem]">
          Accelixy is an all-in-one digital asset platform where you can securely grow your
          portfolio with structured plans, transparent tracking, and reliable account operations.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-base font-medium text-foreground">
          <Link href="/terms" className="transition hover:text-primary">
            Privacy &amp; Policy
          </Link>
          <Link href="/about" className="transition hover:text-primary">
            About Us
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted">
          COPYRIGHT &copy; {new Date().getFullYear()}. All Rights Reserved By accelixy.com
        </p>
      </div>
    </footer>
  );
}

