"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LogOut, Search } from "lucide-react";
import { useAccountAuth } from "@/features/account/application/hooks/account-auth.context";
import { PublicCartLink } from "./public-cart-link";

export function PublicHeader() {
  const router = useRouter();
  const { account, signOut } = useAccountAuth();

  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#03132c] text-white">
      <div className="mx-auto flex h-[62px] w-full max-w-[1536px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label="LIV DOT home"
          className="focus-ring shrink-0 rounded-md"
        >
          <Image
            src="/images/sidebarlogo-sidebar-transparent.png"
            alt="LIV DOT"
            width={2172}
            height={724}
            priority
            className="h-auto w-[124px] sm:w-[140px]"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          <Link
            href="/#all-events"
            className="focus-ring relative rounded px-1 py-2 text-[13px] font-medium text-white after:absolute after:right-1 after:bottom-0 after:left-1 after:h-[2px] after:rounded-full after:bg-[#00aaff] after:content-['']"
          >
            Events
          </Link>
          <Link
            href="/#categories"
            className="focus-ring rounded px-1 py-2 text-[13px] font-medium text-white/85 transition-colors hover:text-white"
          >
            Categories
          </Link>
          <Link
            href="/#how-it-works"
            className="focus-ring rounded px-1 py-2 text-[13px] font-medium text-white/85 transition-colors hover:text-white"
          >
            How It Works
          </Link>
          <Link
            href="/dashboard/support"
            className="focus-ring rounded px-1 py-2 text-[13px] font-medium text-white/85 transition-colors hover:text-white"
          >
            Support
          </Link>
        </nav>

        <Link
          href="/#public-search"
          className="focus-ring hidden max-w-[470px] min-w-0 flex-1 items-center gap-3 rounded-[10px] border border-[#dfe7f2] bg-white px-3.5 py-2.5 text-[#63718c] transition-colors hover:border-[#8bb8fa] lg:flex"
        >
          <Search
            size={18}
            className="shrink-0 text-[#152746]"
            aria-hidden="true"
          />
          <span className="truncate text-xs">
            Search for events, artists, venues or cities...
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#public-search"
            aria-label="Search events"
            className="focus-ring grid size-9 place-items-center rounded-lg text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            <Search size={19} aria-hidden="true" />
          </Link>
          <PublicCartLink />
          {account ? (
            <>
              <Link
                href={account.role === "host" ? "/dashboard" : "/"}
                className="focus-ring hidden min-h-10 items-center gap-1.5 rounded-lg border border-white/65 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
              >
                {account.role === "host" ? "Host dashboard" : "Browse events"}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label={`Sign out ${account.fullName}`}
                className="focus-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-white transition-colors hover:bg-white/10 sm:min-h-10 sm:border sm:border-white/45 sm:px-3 sm:text-[13px]"
              >
                <LogOut size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in?role=host"
                className="focus-ring hidden min-h-10 items-center gap-1.5 rounded-lg border border-white/65 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
              >
                Sign In
              </Link>
              <Link
                href="/create-account?role=host"
                className="focus-ring brand-gradient inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-[#03132c] transition hover:brightness-105 sm:px-4 sm:text-[13px]"
              >
                Create Account
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
