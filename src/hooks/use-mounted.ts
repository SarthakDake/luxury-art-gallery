"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const frame = requestAnimationFrame(onStoreChange);
  return () => cancelAnimationFrame(frame);
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}
