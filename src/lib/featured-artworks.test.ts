import assert from "node:assert/strict";
import test from "node:test";
import { selectFeaturedArtworks } from "./featured-artworks";
import type { Artwork } from "@/types/artwork";

function artwork(id: string, category: string): Artwork {
  return {
    id,
    title: id,
    slug: id,
    imageUrl: "/artworks/x.jpg",
    category,
    subcategory: "sub",
    material: "canvas",
    inStock: true,
    description: "Test",
    sizes: [{ size: "M", price: 1000 }],
  };
}

test("selectFeaturedArtworks picks one per category when possible", () => {
  const items = [
    artwork("a1", "Paintings"),
    artwork("a2", "Paintings"),
    artwork("b1", "Sculpture"),
    artwork("c1", "Prints"),
    artwork("d1", "Textiles"),
  ];

  const picked = selectFeaturedArtworks(items, 4);
  assert.equal(picked.length, 4);
  assert.deepEqual(
    picked.map((item) => item.category).sort(),
    ["Paintings", "Prints", "Sculpture", "Textiles"],
  );
});

test("selectFeaturedArtworks round-robins when fewer categories than limit", () => {
  const items = [
    artwork("a1", "Paintings"),
    artwork("a2", "Paintings"),
    artwork("a3", "Paintings"),
    artwork("b1", "Sculpture"),
    artwork("b2", "Sculpture"),
  ];

  const picked = selectFeaturedArtworks(items, 4);
  assert.deepEqual(picked.map((item) => item.id), ["a1", "b1", "a2", "b2"]);
});
