"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function usePublicScrollReveal(
  scope: RefObject<HTMLElement | null>,
  contentKey?: string,
) {
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils
          .toArray<HTMLElement>("[data-scroll-reveal]", scope.current)
          .forEach((element) => {
            gsap.from(element, {
              y: 12,
              duration: 0.4,
              ease: "expo.out",
              immediateRender: false,
              clearProps: "transform",
              scrollTrigger: {
                trigger: element,
                start: "top 92%",
                once: true,
              },
            });
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
