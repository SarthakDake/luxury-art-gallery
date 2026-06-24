"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function setupScrollReveal(root: ParentNode) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const html = document.documentElement;

  html.classList.toggle("reveal-enabled", !reduced);
  html.classList.toggle("reveal-reduced", reduced);

  root.querySelectorAll("[data-reveal-immediate]").forEach((element) => {
    element.classList.add("is-revealed");
  });

  if (reduced) {
    root.querySelectorAll("[data-reveal]").forEach((element) => {
      element.classList.add("is-revealed");
    });

    return {
      rescan: () => undefined,
      cleanup: () => {
        html.classList.remove("reveal-enabled", "reveal-reduced");
      },
    };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  const observed = new WeakSet<Element>();

  const observeElement = (element: Element) => {
    if (!element.hasAttribute("data-reveal")) return;
    if (element.classList.contains("is-revealed")) return;

    if (element.hasAttribute("data-reveal-immediate")) {
      element.classList.add("is-revealed");
      return;
    }

    if (observed.has(element)) return;

    observed.add(element);
    observer.observe(element);
  };

  const scan = (node: ParentNode = root) => {
    if (node instanceof Element) {
      observeElement(node);
    }

    node.querySelectorAll("[data-reveal]").forEach(observeElement);
  };

  scan();

  const mutationTarget =
    root instanceof Document ? root.documentElement : root;

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          scan(node);
        }
      });
    });
  });

  mutationObserver.observe(mutationTarget, {
    childList: true,
    subtree: true,
  });

  return {
    rescan: () => scan(),
    cleanup: () => {
      observer.disconnect();
      mutationObserver.disconnect();
      html.classList.remove("reveal-enabled", "reveal-reduced");
    },
  };
}

export function ScrollRevealProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const { cleanup, rescan } = setupScrollReveal(document);

    const timeoutId = window.setTimeout(rescan, 0);
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(rescan);
    });
    const fallbackId = window.setTimeout(rescan, 150);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(fallbackId);
      cancelAnimationFrame(frameId);
      cleanup();
    };
  }, [pathname]);

  return children;
}
