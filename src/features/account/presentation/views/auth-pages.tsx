"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  TicketCheck,
} from "lucide-react";
import type { AccountRole } from "../../domain/entities/account-identity";
import { useAccountAuth } from "../../application/hooks/account-auth.context";
import { usePageIntro } from "@/shared/hooks/use-page-intro";
import {
  AUTH_INPUT_CLASS_NAME,
  AUTH_ROLE_OPTIONS,
} from "../constants/account.constants";
import { getAccountDestination } from "../lib/account.utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";

type AuthMode = "sign-in" | "create-account";

export function AccountAuthPage({
  mode,
  initialRole,
  nextPath,
}: {
  readonly mode: AuthMode;
  readonly initialRole: AccountRole;
  readonly nextPath?: string;
}) {
  const isCreateAccount = mode === "create-account";
  const [role, setRole] = useState<AccountRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { account, createAccount, isReady, signIn, signOut, switchRole } =
    useAccountAuth();

  usePageIntro(dialogRef);

  function selectRole(nextRole: AccountRole) {
    setRole(nextRole);
    setErrorMessage(null);
    switchRole(nextRole);
  }

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const fields = new FormData(form);
    const email = String(fields.get("email") ?? "");
    const password = String(fields.get("password") ?? "");

    try {
      if (isCreateAccount) {
        const fullName = String(fields.get("fullName") ?? "");
        const confirmPassword = String(fields.get("confirmPassword") ?? "");
        if (password !== confirmPassword) {
          setErrorMessage(
            "Those passwords do not match. Check them and try again.",
          );
          return;
        }
        await createAccount({ fullName, email, password, role });
      } else {
        await signIn({ email, password, role });
      }

      router.replace(getAccountDestination(role, nextPath));
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not complete that request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const alternateModeHref = isCreateAccount
    ? `/sign-in?role=${role}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`
    : `/create-account?role=${role}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`;

  return (
    <main className="relative isolate flex min-h-[calc(100svh-62px)] flex-1 items-center justify-center overflow-hidden bg-[#03132c] px-4 py-8 sm:px-7 sm:py-10">
      <Image
        src="/images/event-marketing-importance.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,19,44,.5),rgba(3,19,44,.22)_50%,rgba(3,19,44,.55)),linear-gradient(180deg,rgba(3,19,44,.16),rgba(3,19,44,.52))]"
      />

      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) router.replace("/");
        }}
      >
        <DialogContent
          ref={dialogRef}
          className="max-h-[calc(100svh-2rem)] w-[calc(100%-1rem)] max-w-[540px] overflow-y-auto rounded-[22px] border border-white/80 bg-white p-5 shadow-[0_28px_90px_rgba(0,12,36,.35)] sm:w-[calc(100%-2rem)] sm:p-8"
        >
          <div data-public-intro>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#eef6ff] px-3 py-1.5 text-[10px] font-bold tracking-[.13em] text-[#075bff] uppercase">
              <TicketCheck size={14} aria-hidden="true" />
              LIV DOT account
            </div>
            <DialogTitle
              id="auth-heading"
              className="pr-7 text-[30px] leading-tight font-bold tracking-[-.04em] text-[#0b1538] sm:text-[34px]"
            >
              {isCreateAccount ? "Create your account" : "Welcome back"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-[#687693]">
              {isCreateAccount
                ? "Choose how you will use LIV DOT to get started."
                : "Sign in to continue with your LIV DOT account."}
            </DialogDescription>
          </div>

          <div className="mt-6" role="group" aria-label="Choose account type">
            <p className="mb-2 text-xs font-semibold text-[#344365]">
              I’m joining as a
            </p>
            <div className="grid grid-cols-2 gap-2">
              {AUTH_ROLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = role === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectRole(option.id)}
                    className={`focus-ring flex min-h-[76px] items-center gap-3 rounded-xl border px-3 text-left transition-colors ${selected ? "border-[#087cf0] bg-[#f0f7ff] text-[#075bff]" : "border-[#e4ebf4] bg-white text-[#52617f] hover:border-[#b8cee9] hover:bg-[#f9fbff]"}`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-lg ${selected ? "bg-white text-[#087cf0]" : "bg-[#f2f6fc] text-[#52617f]"}`}
                    >
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-[#687693]">
                        {option.detail}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {account && isReady && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#d9e9ff] bg-[#f3f8ff] px-3.5 py-3 text-xs">
              <p className="min-w-0 text-[#344365]">
                Signed in locally as <strong>{account.fullName}</strong>.
              </p>
              <button
                type="button"
                onClick={signOut}
                className="focus-ring shrink-0 rounded-md px-2 py-1 font-semibold text-[#075bff] hover:bg-white"
              >
                Sign out
              </button>
            </div>
          )}

          <form
            onSubmit={(event) => void submitCredentials(event)}
            className="mt-5 space-y-4"
          >
            {isCreateAccount && (
              <label className="block text-xs font-semibold text-[#253454]">
                Full name
                <input
                  autoComplete="name"
                  className={`${AUTH_INPUT_CLASS_NAME} mt-1.5`}
                  maxLength={100}
                  minLength={2}
                  name="fullName"
                  placeholder="Your name"
                  required
                />
              </label>
            )}

            <label className="block text-xs font-semibold text-[#253454]">
              Email address
              <input
                autoComplete="email"
                className={`${AUTH_INPUT_CLASS_NAME} mt-1.5`}
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-[#253454]"
              >
                Password
              </label>
              <span className="relative mt-1.5 block">
                <input
                  id="auth-password"
                  autoComplete={
                    isCreateAccount ? "new-password" : "current-password"
                  }
                  className={`${AUTH_INPUT_CLASS_NAME} pr-12`}
                  minLength={8}
                  name="password"
                  placeholder={
                    isCreateAccount
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="focus-ring absolute inset-y-0.5 right-0.5 grid size-11 place-items-center rounded-lg text-[#687693] transition-colors hover:bg-[#f2f6fc] hover:text-[#075bff]"
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </span>
            </div>

            {isCreateAccount && (
              <label className="block text-xs font-semibold text-[#253454]">
                Confirm password
                <input
                  autoComplete="new-password"
                  className={`${AUTH_INPUT_CLASS_NAME} mt-1.5`}
                  minLength={8}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                />
              </label>
            )}

            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl border border-[#ffd0d5] bg-[#fff4f5] px-3.5 py-3 text-xs leading-5 text-[#a32032]"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={!isReady || isSubmitting}
              aria-busy={isSubmitting}
              className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#075bff] px-4 text-sm font-bold text-white transition-colors hover:bg-[#004de0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? isCreateAccount
                  ? "Creating your account…"
                  : "Signing you in…"
                : isCreateAccount
                  ? "Create account"
                  : "Sign in"}
              {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#687693]">
            <LockKeyhole size={14} aria-hidden="true" />
            <span>Local preview only. No password is sent to a server.</span>
          </div>

          <p className="mt-5 border-t border-[#edf1f6] pt-4 text-center text-sm text-[#52617f]">
            {isCreateAccount ? "Already have an account?" : "New to LIV DOT?"}{" "}
            <Link
              href={alternateModeHref}
              className="focus-ring rounded font-semibold text-[#075bff] hover:underline"
            >
              {isCreateAccount ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="mt-3 text-center text-[10px] leading-5 text-[#5f6d87]">
            Preview accounts live in this browser only and do not secure
            production data.
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
