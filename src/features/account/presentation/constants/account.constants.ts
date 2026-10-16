import { TicketCheck, UserRound, UserRoundPlus } from "lucide-react";
import type { AccountRole } from "../../domain/entities/account-identity";

export const AUTH_ROLE_OPTIONS: readonly {
  readonly id: AccountRole;
  readonly label: string;
  readonly detail: string;
  readonly icon: typeof UserRound;
}[] = [
  {
    id: "host",
    label: "Host",
    detail: "Create and manage events",
    icon: UserRoundPlus,
  },
  {
    id: "guest",
    label: "Guest",
    detail: "Discover live events",
    icon: TicketCheck,
  },
];

export const AUTH_INPUT_CLASS_NAME =
  "focus-ring min-h-12 w-full rounded-xl border border-[#dce5f2] bg-white px-3.5 text-sm text-[#0b1538] placeholder:text-[#63718c] outline-none transition-colors focus:border-[#70aaff]";
