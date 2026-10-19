"use client";

import { useEffect } from "react";

/** Scroll to a hash target after Next.js client navigations (e.g. #enquiry). */
export function SignatureHashScroll() {
  useEffect(() => {
    let hash = window.location.hash.replace(/^#/, "");
    if (hash === "inquiry") {
      hash = "enquiry";
    }
    if (!hash) {
      return;
    }

    const scrollToHash = () => {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const frame = window.requestAnimationFrame(scrollToHash);
    const timeout = window.setTimeout(scrollToHash, 120);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
