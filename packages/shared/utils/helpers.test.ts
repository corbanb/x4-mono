import { describe, test, expect } from "bun:test";
import { isNonNullable, groupBy, sleep } from "./helpers";

// --- isNonNullable ---
describe("isNonNullable", () => {
  test("returns true for non-empty string", () => {
    expect(isNonNullable("hello")).toBe(true);
  });

  test("returns true for number 0", () => {
    expect(isNonNullable(0)).toBe(true);
  });

  test("returns true for empty string", () => {
    expect(isNonNullable("")).toBe(true);
  });

  test("returns true for false", () => {
    expect(isNonNullable(false)).toBe(true);
  });

  test("returns true for empty object", () => {
    expect(isNonNullable({})).toBe(true);
  });

  test("returns true for empty array", () => {
    expect(isNonNullable([])).toBe(true);
  });

  test("returns false for null", () => {
    expect(isNonNullable(null)).toBe(false);
  });

  test("returns false for undefined", () => {
    expect(isNonNullable(undefined)).toBe(false);
  });
});

// --- groupBy ---
describe("groupBy", () => {
  test("groups items by string key", () => {
    const items = [
      { category: "fruit", name: "apple" },
      { category: "vegetable", name: "carrot" },
      { category: "fruit", name: "banana" },
    ];
    const result = groupBy(items, "category");
    expect(Object.keys(result)).toHaveLength(2);
    expect(result["fruit"]).toHaveLength(2);
    expect(result["vegetable"]).toHaveLength(1);
  });

  test("returns empty object for empty array", () => {
    const result = groupBy([], "key" as never);
    expect(Object.keys(result)).toHaveLength(0);
  });

  test("handles single item", () => {
    const items = [{ type: "a", value: 1 }];
    const result = groupBy(items, "type");
    expect(result["a"]).toHaveLength(1);
  });

  test("handles all items in same group", () => {
    const items = [
      { type: "a", value: 1 },
      { type: "a", value: 2 },
      { type: "a", value: 3 },
    ];
    const result = groupBy(items, "type");
    expect(Object.keys(result)).toHaveLength(1);
    expect(result["a"]).toHaveLength(3);
  });

  test("handles all items in different groups", () => {
    const items = [
      { type: "a", value: 1 },
      { type: "b", value: 2 },
      { type: "c", value: 3 },
    ];
    const result = groupBy(items, "type");
    expect(Object.keys(result)).toHaveLength(3);
  });

  test("preserves item order within groups", () => {
    const items = [
      { category: "fruit", name: "apple" },
      { category: "fruit", name: "banana" },
      { category: "fruit", name: "cherry" },
    ];
    const result = groupBy(items, "category");
    expect(result["fruit"]![0]!.name).toBe("apple");
    expect(result["fruit"]![1]!.name).toBe("banana");
    expect(result["fruit"]![2]!.name).toBe("cherry");
  });
});

// --- sleep ---
describe("sleep", () => {
  test("resolves after approximate delay", async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45);
  });

  test("returns a Promise", () => {
    expect(sleep(0)).toBeInstanceOf(Promise);
  });

  test("resolves with undefined", async () => {
    const result = await sleep(0);
    expect(result).toBeUndefined();
  });
});
