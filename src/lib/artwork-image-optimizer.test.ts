import assert from "node:assert/strict";
import test from "node:test";
import {
  getArtworkImageSrc,
  shouldBypassNextImageOptimizer,
} from "./artwork-image";

test("shouldBypassNextImageOptimizer for proxied CMS paths", () => {
  assert.equal(
    shouldBypassNextImageOptimizer("/api/artwork-image/artworks/leaf-cover.png?v=1"),
    true,
  );
  assert.equal(shouldBypassNextImageOptimizer("/hero-banner.jpg"), false);
});

test("getArtworkImageSrc routes shop images through the artwork API", () => {
  assert.equal(
    getArtworkImageSrc("/artworks/leaf-cover.png?v=1"),
    "/api/artwork-image/artworks/leaf-cover.png?v=1",
  );
});
