"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CircleHelp,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { useAccountAuth } from "../../application/hooks/account-auth.context";
import { AccountHeader } from "../components/account-header";
import { getAccountInitials } from "../lib/account.utils";

const panel =
  "rounded-[14px] border border-[#e5ebf4] bg-white p-4 shadow-[0_3px_14px_rgba(18,44,78,.025)] sm:p-5";

export function AccountProfilePage() {
  const { account } = useAccountAuth();
  const accountInitials = getAccountInitials(account?.fullName);

  return (
    <div className="mx-auto w-full max-w-4xl pb-6">
      <AccountHeader
        title="My Profile"
        detail="Your local preview account identity and profile details."
      />
      <section className={panel}>
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center rounded-full border border-[#dce9f7] bg-[#e7f2ff] text-base font-bold text-[#075bff]"
          >
            {accountInitials || "ME"}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[17px] font-bold text-[#0b1538]">
              {account?.fullName ?? "Host account"}
            </h2>
            <p className="mt-1 text-[11px] text-[#687693] capitalize">
              {account?.role ?? "host"}
            </p>
          </div>
          <span className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-[10px] font-semibold text-[#075bff]">
            {accountInitials || "ME"}
          </span>
        </div>
        <div className="mt-5 border-t border-[#edf1f6] pt-4">
          <EmptyState
            size="compact"
            icon={<UserRound size={21} strokeWidth={1.8} />}
            title="Profile editing isn’t available in this preview"
            description="Your name and role come from your local browser account. Profile changes are not saved."
            action={{
              label: "Account settings",
              href: "/dashboard/settings/account",
            }}
          />
        </div>
      </section>
    </div>
  );
}

export function AccountSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-6">
      <AccountHeader
        title="Account Settings"
        detail="Manage account preferences and security."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <section className={panel}>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-[#edf4ff] text-[#075bff]">
              <Bell size={18} aria-hidden="true" />
            </span>
            <h2 className="text-[14px] font-bold text-[#101b43]">
              Notifications
            </h2>
          </div>
          <EmptyState
            size="compact"
            title="Preferences aren’t connected"
            description="Notification preferences will appear when account settings are stored for your profile."
          />
        </section>
        <section className={panel}>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-[#edf4ff] text-[#075bff]">
              <LockKeyhole size={18} aria-hidden="true" />
            </span>
            <h2 className="text-[14px] font-bold text-[#101b43]">Security</h2>
          </div>
          <EmptyState
            size="compact"
            title="Security settings aren’t connected"
            description="This demo stores a password hash in this browser only. Production password and session security need a server authentication service."
          />
        </section>
      </div>
      <Link
        href="/dashboard/support"
        className="focus-ring mt-4 inline-flex items-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#075bff] hover:bg-[#f7faff]"
      >
        <CircleHelp size={16} aria-hidden="true" /> Get help with account
        settings <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
