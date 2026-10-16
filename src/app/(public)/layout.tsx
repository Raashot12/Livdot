import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PublicShell } from "@/features/public-events/presentation/components/public-shell";

export const metadata: Metadata = {
  title: "Discover live events | LIV DOT",
  description: "Explore public events listed on LIV DOT.",
};

export default function PublicLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
