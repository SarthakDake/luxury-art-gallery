import assert from "node:assert/strict";
import test from "node:test";
import { coverImageObjectFitClass } from "./cover-image-display";

test("coverImageObjectFitClass uses cover for portrait", () => {
  assert.equal(coverImageObjectFitClass("portrait"), "object-cover object-center");
  assert.equal(coverImageObjectFitClass(undefined), "object-cover object-center");
});

test("coverImageObjectFitClass uses contain for landscape", () => {
  assert.equal(
    coverImageObjectFitClass("landscape"),
    "object-contain object-center",
  );
});
