"use client";

import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type SidebarNavProps = {
  items: SidebarNavItem[];
  showLogo?: boolean;
  className?: string;
  onNavigate?: () => void;
  bannerSrc?: string;
};

export function SidebarNav({
  items,
  showLogo = true,
  className,
  onNavigate,
  bannerSrc = "https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/admin.png",
}: SidebarNavProps) {
  const pathname = usePathname();
  const activeHref =
    items
      .filter(
        (item) =>
          item.href !== "#" &&
          (pathname === item.href || pathname.startsWith(`${item.href}/`)),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? "";

  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col overflow-y-auto border-r border-border bg-card/70 p-4 backdrop-blur",
        className,
      )}
    >
      {showLogo ? (
        <div className="mb-2 px-1">
          <Logo width={120} height={34} />
        </div>
      ) : null}

      <nav className="flex flex-col gap-1 md:flex-1">
        {items.map((item) => {
          const isActive = item.href === activeHref;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary text-secondary"
                  : "text-muted hover:bg-background/60 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 md:mt-auto md:pt-3">
        <div className="mx-auto w-full max-w-30 overflow-hidden sm:max-w-42.5">
          <Image
            src={bannerSrc}
            alt="Dashboard sidebar banner"
            width={320}
            height={200}
            unoptimized
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </aside>
  );
}
