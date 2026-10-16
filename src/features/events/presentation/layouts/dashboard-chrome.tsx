"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Crown,
  LifeBuoy,
  LogOut,
  Home,
  PlusCircle,
  Radio,
  Search,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useAccountAuth } from "@/features/account/application/hooks/account-auth.context";
import { getAccountInitials } from "@/features/account/presentation/lib/account.utils";
import {
  formatTicketMoney,
  getOrderTicketCount,
  getSimulatedOrdersSnapshot,
  parseSimulatedOrders,
  subscribeSimulatedOrders,
} from "@/shared/lib/demo-ticketing-store";

const READ_ORDER_NOTIFICATIONS_KEY = "liv-dot:read-order-notifications:v1";
const NOTIFICATION_READ_CHANGE_EVENT = "liv-dot:notification-read-change";

function readNotificationIds() {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(READ_ORDER_NOTIFICATIONS_KEY) ?? "[]",
    );
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function saveNotificationIds(ids: string[]) {
  try {
    window.localStorage.setItem(
      READ_ORDER_NOTIFICATIONS_KEY,
      JSON.stringify(ids),
    );
  } catch {
    // Keep the notification menu usable when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(NOTIFICATION_READ_CHANGE_EVENT));
}

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function NotificationBell() {
  const ordersSnapshot = useSyncExternalStore(
    subscribeSimulatedOrders,
    getSimulatedOrdersSnapshot,
    () => null,
  );
  const [readIds, setReadIds] = useState<string[]>([]);
  const orders = parseSimulatedOrders(ordersSnapshot);
  const readIdSet = new Set(readIds);
  const unreadCount = orders.filter((order) => !readIdSet.has(order.id)).length;

  useEffect(() => {
    const syncReadIds = () => setReadIds(readNotificationIds());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === READ_ORDER_NOTIFICATIONS_KEY || event.key === null) {
        syncReadIds();
      }
    };

    syncReadIds();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(NOTIFICATION_READ_CHANGE_EVENT, syncReadIds);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(NOTIFICATION_READ_CHANGE_EVENT, syncReadIds);
    };
  }, []);

  function markRead(orderId: string) {
    const ids = new Set(readNotificationIds());
    ids.add(orderId);
    const nextIds = [...ids];
    setReadIds(nextIds);
    saveNotificationIds(nextIds);
  }

  function markAllRead() {
    const ids = new Set(readNotificationIds());
    orders.forEach((order) => ids.add(order.id));
    const nextIds = [...ids];
    setReadIds(nextIds);
    saveNotificationIds(nextIds);
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications, ${unreadCount} unread`}
          className="focus-ring relative grid size-10 place-items-center rounded-full text-[#4c5f80] transition hover:bg-[#f0f5fc]"
        >
          <Bell size={20} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-[#ff3b4d] px-1 text-[10px] font-bold text-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={9}
        className="z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e5ebf4] bg-white p-2 text-[#0b1538] shadow-[0_16px_45px_rgba(11,21,56,.16)]"
      >
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-[#0b1538]">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                markAllRead();
              }}
              className="min-h-8 cursor-pointer rounded-md px-2 text-[11px] font-semibold text-[#075bff] focus:bg-[#f2f6fc] focus:text-[#075bff]"
            >
              Mark all read
            </DropdownMenuItem>
          )}
        </div>
        <DropdownMenuSeparator className="my-1 bg-[#e5ebf4]" />
        {orders.length === 0 ? (
          <div className="px-3 py-7 text-center">
            <Bell
              size={20}
              className="mx-auto mb-2 text-[#8a98af]"
              aria-hidden="true"
            />
            <p className="text-[13px] font-semibold text-[#263653]">
              You’re all caught up
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[#687693]">
              New ticket orders will appear here.
            </p>
          </div>
        ) : (
          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
            {orders.slice(0, 12).map((order) => {
              const isUnread = !readIdSet.has(order.id);
              const ticketCount = getOrderTicketCount(order);
              return (
                <DropdownMenuItem
                  key={order.id}
                  asChild
                  onSelect={() => markRead(order.id)}
                  className={`min-h-0 cursor-pointer items-start gap-3 rounded-lg px-3 py-3 focus:bg-[#f2f6fc] ${
                    isUnread ? "bg-[#f3f7ff]" : ""
                  }`}
                >
                  <Link
                    href={
                      order.eventId
                        ? `/dashboard/events/${encodeURIComponent(order.eventId)}/tickets`
                        : "/dashboard/tickets"
                    }
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#eaf1ff] text-[#075bff]">
                      <Ticket size={15} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-[12px] font-semibold leading-4 text-[#142544]">
                          New ticket order
                        </span>
                        {isUnread && (
                          <span
                            aria-label="Unread"
                            className="mt-1 size-2 shrink-0 rounded-full bg-[#087cf6]"
                          />
                        )}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-[#536380]">
                        {order.eventTitle} · {ticketCount} ticket
                        {ticketCount === 1 ? "" : "s"} from {order.contactName}
                      </span>
                      <span className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-[#7a879d]">
                        <span>{formatNotificationDate(order.createdAt)}</span>
                        <span className="shrink-0 font-semibold text-[#263653]">
                          {formatTicketMoney(order.total, order.currency)}
                        </span>
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
        {orders.length > 0 && (
          <>
            <DropdownMenuSeparator className="my-1 bg-[#e5ebf4]" />
            <DropdownMenuItem
              asChild
              className="min-h-9 justify-center rounded-lg text-[11px] font-semibold text-[#075bff] focus:bg-[#f2f6fc] focus:text-[#075bff]"
            >
              <Link href="/dashboard/tickets">View all orders</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const mainLinks = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/events/new", label: "Create Event", icon: PlusCircle },
];

const operationsLinks = [
  {
    href: "/dashboard/readiness",
    label: "Readiness",
    icon: CheckCircle2,
  },
  {
    href: "/dashboard/crew",
    label: "Crew & Streaming",
    icon: Users,
  },
  {
    href: "/dashboard/live-control",
    label: "Live Control",
    icon: Radio,
  },
  {
    href: "/dashboard/tickets",
    label: "Tickets & Orders",
    icon: Ticket,
  },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const supportLink = {
  href: "/dashboard/support",
  label: "Support",
  icon: CircleHelp,
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  if (href === "/dashboard/readiness") {
    return (
      pathname === href ||
      /^\/dashboard\/events\/[^/]+\/readiness(?:\/.*)?$/.test(pathname)
    );
  }
  if (href === "/dashboard/events") {
    return (
      pathname === href ||
      /^\/dashboard\/events\/(?!new(?:\/|$))[^/]+(?:\/manage)?$/.test(pathname)
    );
  }
  if (href === "/dashboard/live-control") {
    return (
      pathname === href ||
      /^\/dashboard\/events\/[^/]+\/live(?:\/.*)?$/.test(pathname)
    );
  }
  if (href === "/dashboard/tickets") {
    return (
      pathname === href ||
      /^\/dashboard\/events\/[^/]+\/tickets(?:\/.*)?$/.test(pathname)
    );
  }
  if (href === "/dashboard/crew") {
    return (
      pathname === href ||
      /^\/dashboard\/events\/[^/]+\/(?:crew|replay)(?:\/.*)?$/.test(pathname)
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  pathname: string;
}) {
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`focus-ring group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[13px] font-medium transition-colors duration-200 ${
        active
          ? "bg-gradient-to-r from-[#075bff] via-[#087cf6] to-[#00bdd1] text-white shadow-[0_8px_20px_rgba(0,100,239,0.25)]"
          : "text-[#d4deef] hover:bg-white/8 hover:text-white"
      }`}
    >
      <Icon size={19} strokeWidth={active ? 2.3 : 2} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export function DashboardChrome({
  children,
}: {
  readonly children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { account, isReady, signOut } = useAccountAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!account) {
      router.replace(`/sign-in?role=host&next=${encodeURIComponent(pathname)}`);
    } else if (account.role !== "host") {
      router.replace("/");
    }
  }, [account, isReady, pathname, router]);

  if (!isReady || !account || account.role !== "host") {
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#f5f8fc] p-6 text-sm text-[#52617f]"
        role="status"
      >
        Checking your host preview session…
      </main>
    );
  }

  const accountInitials = getAccountInitials(account.fullName);

  function handleSignOut() {
    signOut();
    toast.success("Signed out", {
      description: "Your local preview session has ended.",
    });
    router.replace("/sign-in?role=host");
  }

  return (
    <div className="min-h-screen bg-[#f8faff] md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen flex-col overflow-hidden bg-[#061a37] px-3 pt-5 pb-4 text-white md:sticky md:top-0 md:flex md:h-screen">
        <Link
          href="/dashboard"
          aria-label="LIV DOT dashboard home"
          className="focus-ring mb-9 flex h-[60px] shrink-0 items-center px-2.5"
        >
          <Image
            src="/images/sidebarlogo-sidebar-transparent.png"
            alt=""
            width={2172}
            height={724}
            className="h-auto w-[180px] max-w-none object-contain"
          />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="flex shrink-0 flex-col gap-1"
        >
          {mainLinks.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>
        <div className="mx-2 my-4 shrink-0 border-t border-white/10" />
        <nav
          aria-label="Event operations"
          className="dashboard-operations-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain"
        >
          {operationsLinks.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>
        <div className="mt-auto flex shrink-0 flex-col gap-4 pt-5">
          <NavLink {...supportLink} pathname={pathname} />
          <section className="rounded-[14px] border border-[#17518b]/60 bg-gradient-to-br from-[#0a2549] to-[#052d4b] px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Crown size={17} className="text-[#ffc34d]" aria-hidden="true" />
              Upgrade to Pro
            </div>
            <p className="mt-2 text-[12px] leading-[1.6] text-[#c6d6ed]">
              Get advanced analytics, more crew seats and premium features.
            </p>
            <Link
              href="/dashboard/analytics"
              className="focus-ring mt-4 flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#075bff] to-[#00c8d7] text-[13px] font-semibold text-white transition hover:brightness-110"
            >
              Explore Pro <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-[#e6ebf3] bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            aria-label="LIV DOT dashboard home"
            className="focus-ring flex shrink-0 items-center md:hidden"
          >
            <Image
              src="/images/sidebarlogo.webp"
              alt=""
              width={2172}
              height={724}
              className="h-auto w-[96px] object-contain"
            />
          </Link>
          <form
            role="search"
            action="/dashboard/events"
            className="hidden h-11 w-full max-w-[660px] items-center gap-3 rounded-xl border border-[#e5ebf4] bg-[#f9fbfe] px-4 shadow-[inset_0_1px_2px_rgba(11,21,56,.02)] sm:flex"
          >
            <Search
              size={18}
              className="shrink-0 text-[#566987]"
              aria-hidden="true"
            />
            <input
              name="q"
              aria-label="Search events"
              placeholder="Search events, orders, crew, or help..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#0b1538] outline-none placeholder:text-[#657591]"
            />
            <kbd className="rounded border border-[#d9e1ed] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#657591]">
              ⌘ K
            </kbd>
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-5 sm:gap-4">
            <span className="hidden rounded-full border border-[#e5ebf4] bg-[#f7faff] px-2.5 py-1 text-[10px] font-semibold tracking-[.07em] text-[#536380] uppercase sm:inline-flex">
              Local API
            </span>
            <NotificationBell />
            <div className="hidden h-9 border-l border-[#e8edf4] sm:block" />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="focus-ring group flex items-center gap-2 rounded-full py-1 pr-1.5 pl-1 text-left transition hover:bg-[#f2f6fc]"
                  aria-label={`Open account menu for ${account.fullName}`}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-9 place-items-center rounded-full border-2 border-white bg-[#e7f2ff] text-[10px] font-bold text-[#075bff] shadow-sm"
                  >
                    {accountInitials || "ME"}
                  </span>
                  <span className="hidden leading-tight sm:block">
                    <span className="block text-[12px] font-semibold text-[#0b1538]">
                      {account.fullName}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#687693]">
                      Host
                    </span>
                  </span>
                  <ChevronDown
                    size={15}
                    aria-hidden="true"
                    className="hidden text-[#536380] transition-transform group-data-[state=open]:rotate-180 sm:block"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={9}
                className="z-50 w-[290px] rounded-xl border border-[#e5ebf4] bg-white p-2 text-[#0b1538] shadow-[0_16px_45px_rgba(11,21,56,.16)]"
              >
                <DropdownMenuLabel className="px-3 py-2.5 font-normal">
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e7f2ff] text-xs font-bold text-[#075bff]"
                    >
                      {accountInitials || "ME"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-[#0b1538]">
                        {account.fullName}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[#687693]">
                        Host
                      </span>
                    </span>
                    <span className="ml-auto rounded-md bg-[#edf4ff] px-2 py-1 text-[9px] font-semibold tracking-[.08em] text-[#075bff]">
                      {accountInitials || "ME"}
                    </span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-[#e5ebf4]" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    asChild
                    className="min-h-10 gap-2.5 rounded-lg px-3 text-[11px] font-medium text-[#0b1538] focus:bg-[#f2f6fc] focus:text-[#075bff]"
                  >
                    <Link href="/dashboard/profile">
                      <Users size={18} aria-hidden="true" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="min-h-10 gap-2.5 rounded-lg px-3 text-[11px] font-medium text-[#0b1538] focus:bg-[#f2f6fc] focus:text-[#075bff]"
                  >
                    <Link href="/dashboard/settings/account">
                      <Settings size={18} aria-hidden="true" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="min-h-10 gap-2.5 rounded-lg px-3 text-[11px] font-medium text-[#0b1538] focus:bg-[#f2f6fc] focus:text-[#075bff]"
                  >
                    <Link href="/dashboard/support">
                      <LifeBuoy size={18} aria-hidden="true" />
                      Help &amp; Support
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1 bg-[#e5ebf4]" />
                <DropdownMenuItem
                  onSelect={handleSignOut}
                  className="min-h-10 gap-2.5 rounded-lg px-3 text-[11px] font-semibold text-[#ff3b4d] focus:bg-[#fff1f2] focus:text-[#e12b3f]"
                >
                  <LogOut size={18} aria-hidden="true" />
                  Sign Out
                  <span className="ml-auto rounded bg-[#fff0f1] px-1.5 py-0.5 text-[8px] font-semibold text-[#d93645]">
                    Local
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <nav
          aria-label="Mobile navigation"
          className="flex gap-1 overflow-x-auto border-b border-[#e6ebf3] bg-white px-3 py-2 md:hidden"
        >
          {[...mainLinks, ...operationsLinks, supportLink].map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-[#eaf1ff] text-[#075bff]"
                    : "text-[#53627e] hover:bg-[#f4f7fb]"
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="mx-auto w-full max-w-[1760px] px-4 pt-5 pb-8 sm:px-6 sm:pt-6 lg:px-[30px] lg:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
