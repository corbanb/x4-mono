import { describe, test, expect } from "bun:test";
import { formatDate, formatCurrency, truncate, slugify } from "./formatting";

// --- formatDate ---
describe("formatDate", () => {
  test("formats a specific known date with default locale", () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    expect(formatDate(date)).toBe("Jan 15, 2024");
  });

  test("formats end-of-year date", () => {
    const date = new Date(2023, 11, 31); // Dec 31, 2023
    expect(formatDate(date)).toBe("Dec 31, 2023");
  });

  test("formats leap day", () => {
    const date = new Date(2024, 1, 29); // Feb 29, 2024
    expect(formatDate(date)).toBe("Feb 29, 2024");
  });

  test("formats with custom locale", () => {
    const date = new Date(2024, 0, 15);
    const result = formatDate(date, "de-DE");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });
});

// --- formatCurrency ---
describe("formatCurrency", () => {
  test("formats positive amount with default USD", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  test("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  test("formats negative amount", () => {
    expect(formatCurrency(-50)).toBe("-$50.00");
  });

  test("formats large number with commas", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000.00");
  });

  test("formats with custom currency EUR", () => {
    const result = formatCurrency(100, "EUR");
    expect(result).toContain("100");
  });

  test("formats with custom currency GBP", () => {
    const result = formatCurrency(100, "GBP");
    expect(result).toContain("100");
  });

  test("formats decimal precision to 2 places", () => {
    expect(formatCurrency(19.9)).toBe("$19.90");
  });
});

// --- truncate ---
describe("truncate", () => {
  test("returns original string when shorter than maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  test("returns original string when equal to maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  test("truncates and adds ellipsis when longer than maxLength", () => {
    expect(truncate("Hello World", 8)).toBe("Hello...");
  });

  test("truncated result is exactly maxLength characters", () => {
    const result = truncate("Hello World", 8);
    expect(result.length).toBe(8);
  });

  test("handles maxLength of 4", () => {
    expect(truncate("Hello", 4)).toBe("H...");
  });

  test("handles empty string", () => {
    expect(truncate("", 10)).toBe("");
  });

  test("handles single character string within maxLength", () => {
    expect(truncate("a", 5)).toBe("a");
  });
});

// --- slugify ---
describe("slugify", () => {
  test("converts to lowercase", () => {
    expect(slugify("HELLO")).toBe("hello");
  });

  test("replaces spaces with hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  test("removes special characters", () => {
    expect(slugify("hello!@#world")).toBe("hello-world");
  });

  test("replaces multiple consecutive specials with single hyphen", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  test("strips leading hyphens", () => {
    expect(slugify("!hello")).toBe("hello");
  });

  test("strips trailing hyphens", () => {
    expect(slugify("hello!")).toBe("hello");
  });

  test("handles already-valid slug", () => {
    expect(slugify("hello-world")).toBe("hello-world");
  });

  test("handles string with numbers", () => {
    expect(slugify("hello world 2024")).toBe("hello-world-2024");
  });

  test("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  test("handles mixed case with spaces and symbols", () => {
    expect(slugify("Hello World! #2024")).toBe("hello-world-2024");
  });
});
