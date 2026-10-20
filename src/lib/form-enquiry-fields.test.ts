import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeOptionalEnquiryEmail,
  sanitizeEnquiryField,
} from "./form-enquiry-fields";

test("sanitizeEnquiryField trims and enforces max length", () => {
  assert.equal(sanitizeEnquiryField("  Ada  ", 10), "Ada");
  assert.equal(sanitizeEnquiryField("x".repeat(11), 10), null);
  assert.equal(sanitizeEnquiryField("", 10, false), "");
  assert.equal(sanitizeEnquiryField(null, 10), null);
});

test("normalizeOptionalEnquiryEmail accepts blank or valid email", () => {
  assert.deepEqual(normalizeOptionalEnquiryEmail(""), { ok: true, email: "" });
  assert.deepEqual(normalizeOptionalEnquiryEmail("  a@b.co  "), {
    ok: true,
    email: "a@b.co",
  });
  assert.equal(normalizeOptionalEnquiryEmail("not-an-email").ok, false);
});
