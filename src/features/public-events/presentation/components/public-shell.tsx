import type { ReactNode } from "react";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

export function PublicShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fd] text-[#0b1538]">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
