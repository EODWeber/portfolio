import { describe, expect, test } from "vitest";

import { parseCsv } from "@/lib/admin/utils";

// Minimal, focused tests for parser helpers used by bulk imports

describe("parseCsv", () => {
  test("splits comma/space and trims", () => {
    expect(parseCsv("a, b, c")).toEqual(["a", "b", "c"]);
  });

  test("returns empty array for empty-ish input", () => {
    expect(parseCsv("")).toEqual([]);
    expect(parseCsv(undefined)).toEqual([]);
    expect(parseCsv(null as unknown as string)).toEqual([]);
  });

  test("handles single value", () => {
    expect(parseCsv("one")).toEqual(["one"]);
  });
});
