"use client";

import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1,
  );
}

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  options?: {
    onEscape?: () => void;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
  },
) {
  const onEscape = options?.onEscape;
  const returnFocusRef = options?.returnFocusRef;

  useEffect(() => {
    if (!active) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const trappedContainer = container;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusReturnElement = returnFocusRef?.current;

    function focusInitialElement() {
      const focusable = getFocusableElements(trappedContainer);
      const target = focusable[0] ?? trappedContainer;

      if (!trappedContainer.hasAttribute("tabindex")) {
        trappedContainer.tabIndex = -1;
      }

      target.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(trappedContainer);

      if (focusable.length === 0) {
        event.preventDefault();
        trappedContainer.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const frameId = requestAnimationFrame(focusInitialElement);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown);

      const returnTarget = focusReturnElement ?? previouslyFocused;
      returnTarget?.focus();
    };
  }, [active, containerRef, onEscape, returnFocusRef]);
}
