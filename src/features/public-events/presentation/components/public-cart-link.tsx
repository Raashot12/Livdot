"use client";

import { useState, useSyncExternalStore } from "react";
import { ShoppingCart } from "lucide-react";
import {
  getCheckoutSelectionSnapshot,
  getCheckoutCartSelectionCount,
  parseCurrentCheckoutCart,
  subscribeCheckoutSelection,
} from "../lib/public-checkout";
import { PublicCartDrawer } from "./public-cart-drawer";

export function PublicCartLink() {
  const [open, setOpen] = useState(false);
  const snapshot = useSyncExternalStore(
    subscribeCheckoutSelection,
    getCheckoutSelectionSnapshot,
    () => null,
  );
  const selections = parseCurrentCheckoutCart(snapshot);
  const count = getCheckoutCartSelectionCount(selections);

  return (
    <>
      <button
        type="button"
        aria-label={count ? `Open basket with ${count} tickets` : "Open basket"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="focus-ring relative grid size-9 shrink-0 place-items-center rounded-lg text-white transition-colors hover:bg-white/10"
      >
        <ShoppingCart size={19} aria-hidden="true" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid min-h-[17px] min-w-[17px] place-items-center rounded-full bg-[#087cf0] px-1 text-[9px] leading-none font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      <PublicCartDrawer
        open={open}
        onOpenChange={setOpen}
        selections={selections}
        itemCount={count}
      />
    </>
  );
}
