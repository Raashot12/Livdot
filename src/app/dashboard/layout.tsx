import type { ReactNode } from "react";
import { DashboardChrome } from "@/features/events/presentation/layouts/dashboard-chrome";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <DashboardChrome>{children}</DashboardChrome>;
}
