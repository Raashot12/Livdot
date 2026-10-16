"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP);

export function usePageIntro(
  scope: RefObject<HTMLElement | null>,
  contentKey?: string,
) {
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = gsap.utils.toArray<HTMLElement>(
          "[data-public-intro]",
          scope.current,
        );

        if (targets.length === 0) return;

        gsap.from(targets, {
          y: 14,
          opacity: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "expo.out",
          clearProps: "transform,opacity",
        });
      });

      return () => media.revert();
    },
    {
      scope,
      dependencies: [contentKey],
      revertOnUpdate: true,
    },
  );
}
