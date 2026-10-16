"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function AppLoader({ label = "Loading LIV DOT" }: { label?: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const shimmer = gsap.to(".app-loader-shimmer", {
          backgroundPosition: "200% 0",
          duration: 1.4,
          ease: "sine.inOut",
          repeat: -1,
        });
        const handleVisibilityChange = () => {
          if (document.hidden) shimmer.pause();
          else shimmer.resume();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        handleVisibilityChange();

        return () => {
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          shimmer.kill();
        };
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <main
      ref={root}
      aria-busy="true"
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#06172f] px-5 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(8,124,240,.2),transparent_48%)]"
      />
      <div className="relative flex w-full max-w-sm flex-col items-center">
        <Image
          src="/images/sidebarlogo-sidebar-transparent.png"
          alt=""
          width={600}
          height={200}
          priority
          className="h-auto w-[min(72vw,280px)] object-contain"
        />
        <p
          role="status"
          aria-live="polite"
          className="mt-6 text-sm font-medium tracking-[0.02em] text-white/75"
        >
          {label}
        </p>
        <div
          aria-hidden="true"
          className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/10"
        >
          <span
            className="app-loader-shimmer block h-full w-full rounded-full"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, #087cf0 45%, #00d4e8 55%, transparent 100%)",
              backgroundSize: "200% 100%",
              backgroundPosition: "50% 0",
            }}
          />
        </div>
      </div>
    </main>
  );
}
