"use client";

import type { Artwork } from "@/types/artwork";
import { createContext, useContext } from "react";

const ArtworksContext = createContext<Artwork[]>([]);

export function ArtworksProvider({
  artworks,
  children,
}: {
  artworks: Artwork[];
  children: React.ReactNode;
}) {
  return (
    <ArtworksContext.Provider value={artworks}>{children}</ArtworksContext.Provider>
  );
}

export function useArtworks() {
  return useContext(ArtworksContext);
}
