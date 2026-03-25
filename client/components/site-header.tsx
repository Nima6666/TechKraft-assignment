"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListingsLimitSelect } from "@/components/listings-limit-select";
import { useIsAdmin } from "@/context/admin-mode-context";

export function SiteHeader() {
  const isAdmin = useIsAdmin();
  const pathname = usePathname();
  const listingsHref = isAdmin ? "/admin" : "/";

  return (
    <header className="fixed top-0 z-50 w-full max-w-[100vw] border-b border-outline-variant/50 bg-white/85 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
          <Link
            href={listingsHref}
            className="font-headline shrink-0 text-xl font-bold tracking-tight text-primary sm:text-2xl"
          >
            TechKraft Assignment
            {isAdmin ? (
              <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-primary/80">
                Admin
              </span>
            ) : null}
          </Link>
          <ListingsLimitSelect />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={listingsHref}
            className={`hidden py-1 font-headline text-sm font-bold tracking-tight md:inline-block ${
              pathname === "/" || pathname === "/admin"
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Listings
          </Link>
          {isAdmin ? (
            <Link
              href="/"
              className="rounded-full border border-outline-variant/60 bg-surface-container px-4 py-2 font-headline text-xs font-bold text-on-surface transition hover:bg-surface-container-high active:scale-95 md:px-5 md:text-sm"
            >
              Public site
            </Link>
          ) : (
            <Link
              href="/admin"
              className="rounded-full bg-primary px-4 py-2 font-headline text-xs font-bold text-on-primary transition hover:opacity-90 active:scale-95 md:px-5 md:text-sm"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
