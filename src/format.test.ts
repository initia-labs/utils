import BigNumber from "bignumber.js";
import {
  formatNumber,
  formatAmount,
  fromBaseUnit,
  toBaseUnit,
  formatPercent,
} from "./format";

describe("formatNumber", () => {
  it("formats basic numbers", () => {
    expect(formatNumber("1234.567")).toBe("1,234.56");
    expect(formatNumber("1234.567", { dp: 3 })).toBe("1,234.567");
    expect(formatNumber("1234.567", { dp: 0 })).toBe("1,234");
    expect(formatNumber("0")).toBe("0");
  });

  it("handles negative numbers", () => {
    expect(formatNumber("-1234.567")).toBe("-1,234.56");
    expect(formatNumber("-0.123")).toBe("-0.12");
    expect(formatNumber("-999999.99")).toBe("-999,999.99");
  });

  it("handles abbreviations", () => {
    expect(formatNumber("1234", { abbr: true })).toBe("1.23K");
    expect(formatNumber("1234567", { abbr: true })).toBe("1.23M");
    expect(formatNumber("1234567890", { abbr: true })).toBe("1.23B");
    expect(formatNumber("1234567890123", { abbr: true })).toBe("1.23T");
    expect(formatNumber("999", { abbr: true })).toBe("999");
  });

  it("handles abbreviations with negative numbers", () => {
    expect(formatNumber("-1234", { abbr: true })).toBe("-1.23K");
    expect(formatNumber("-1234567", { abbr: true })).toBe("-1.23M");
    expect(formatNumber("-1234567890", { abbr: true })).toBe("-1.23B");
    expect(formatNumber("-1234567890123", { abbr: true })).toBe("-1.23T");
  });

  it("handles abbreviations with custom decimal places", () => {
    expect(formatNumber("1234", { abbr: true, dp: 0 })).toBe("1K");
    expect(formatNumber("1234", { abbr: true, dp: 3 })).toBe("1.234K");
    expect(formatNumber("1500000", { abbr: true, dp: 1 })).toBe("1.5M");
  });

  it("handles BigNumber input", () => {
    expect(formatNumber(new BigNumber("1234.567"))).toBe("1,234.56");
    expect(formatNumber(new BigNumber("-1234.567"))).toBe("-1,234.56");
  });

  it("handles invalid values with no fallback", () => {
    expect(formatNumber("invalid")).toBe("");
    expect(formatNumber(NaN)).toBe("");
    expect(formatNumber(Infinity)).toBe("");
    expect(formatNumber(-Infinity)).toBe("");
  });

  it("handles undefined and null values with no fallback", () => {
    expect(formatNumber(undefined)).toBe("");
    expect(formatNumber()).toBe("");
    expect(formatNumber(null as unknown as string)).toBe("");
  });

  it("returns fallback for invalid values when provided", () => {
    expect(formatNumber("invalid", { fallback: "N/A" })).toBe("N/A");
    expect(formatNumber(NaN, { fallback: "N/A" })).toBe("N/A");
    expect(formatNumber(Infinity, { fallback: "N/A" })).toBe("N/A");
    expect(formatNumber(-Infinity, { fallback: "N/A" })).toBe("N/A");
  });

  it("returns fallback for null and undefined when provided", () => {
    expect(formatNumber(undefined, { fallback: "N/A" })).toBe("N/A");
    expect(formatNumber(null as unknown as string, { fallback: "N/A" })).toBe(
      "N/A",
    );
  });

  it("returns different fallback values", () => {
    expect(formatNumber(null as unknown as string, { fallback: "-" })).toBe(
      "-",
    );
    expect(formatNumber(undefined, { fallback: "No data" })).toBe("No data");
    expect(formatNumber(NaN, { fallback: "Invalid" })).toBe("Invalid");
  });

  it("normal formatting remains unchanged for valid numbers", () => {
    expect(formatNumber("1234.567", { fallback: "N/A" })).toBe("1,234.56");
    expect(formatNumber("0", { fallback: "N/A" })).toBe("0");
    expect(formatNumber("1000000", { abbr: true, fallback: "N/A" })).toBe(
      "1.00M",
    );
  });
});

describe("formatAmount", () => {
  it("formats amounts with decimals", () => {
    expect(formatAmount("1234567890", { decimals: 6 })).toBe("1,234.567890");
    expect(formatAmount("1234567890", { decimals: 6, dp: 3 })).toBe(
      "1,234.567",
    );
    expect(formatAmount("1000000", { decimals: 6 })).toBe("1.000000");
  });

  it("handles negative amounts", () => {
    expect(formatAmount("-1234567890", { decimals: 6 })).toBe("-1,234.567890");
    expect(formatAmount("-1000000", { decimals: 6 })).toBe("-1.000000");
  });

  it("handles zero decimals", () => {
    expect(formatAmount("1234567890", { decimals: 0 })).toBe("1,234,567,890");
  });

  it("handles falsy values", () => {
    expect(formatAmount()).toBe("");
    expect(formatAmount(null as unknown as string)).toBe("");
    expect(formatAmount(undefined)).toBe("");
    expect(formatAmount("")).toBe("");
    expect(formatAmount(0)).toBe("0");
  });

  it("uses custom fallback for invalid values", () => {
    expect(formatAmount(undefined, { fallback: "0" })).toBe("0");
    expect(formatAmount(null as unknown as string, { fallback: "0" })).toBe(
      "0",
    );
    expect(formatAmount("", { fallback: "0" })).toBe("0");
    expect(formatAmount("invalid", { fallback: "N/A" })).toBe("N/A");
  });

  it("auto-calculates dp", () => {
    expect(formatAmount("1234567890123456", { decimals: 18 })).toBe("0.001234");
    expect(formatAmount("1234567890123456789012", { decimals: 18 })).toBe(
      "1,234.567890",
    );
  });

  it("handles abbreviations", () => {
    expect(formatAmount("1234567890", { decimals: 6, abbr: true })).toBe(
      "1.234567K",
    );
    expect(formatAmount("1234567890000", { decimals: 6, abbr: true })).toBe(
      "1.234567M",
    );
    expect(formatAmount("1234567890000000", { decimals: 6, abbr: true })).toBe(
      "1.234567B",
    );
    expect(
      formatAmount("1234567890000000000", { decimals: 6, abbr: true }),
    ).toBe("1.234567T");
  });

  it("handles abbreviations with custom dp", () => {
    expect(formatAmount("1234567890", { decimals: 6, abbr: true, dp: 3 })).toBe(
      "1.234K",
    );
    expect(
      formatAmount("1234567890000", { decimals: 6, abbr: true, dp: 0 }),
    ).toBe("1M");
  });

  it("handles negative abbreviations", () => {
    expect(formatAmount("-1234567890", { decimals: 6, abbr: true })).toBe(
      "-1.234567K",
    );
    expect(formatAmount("-1234567890000000", { decimals: 6, abbr: true })).toBe(
      "-1.234567B",
    );
  });
});

describe("fromBaseUnit", () => {
  it("converts from base unit", () => {
    expect(fromBaseUnit("1234567890", { decimals: 6 })).toBe("1234.567890");
    expect(fromBaseUnit("1234567890", { decimals: 0 })).toBe("1234567890");
    expect(fromBaseUnit("1000000", { decimals: 6 })).toBe("1.000000");
  });

  it("handles negative values", () => {
    expect(fromBaseUnit("-1234567890", { decimals: 6 })).toBe("-1234.567890");
    expect(fromBaseUnit("-1000000", { decimals: 6 })).toBe("-1.000000");
  });

  it("limits decimal places", () => {
    expect(fromBaseUnit("1234567890123456789", { decimals: 18 })).toBe(
      "1.234567",
    );
    expect(fromBaseUnit("1", { decimals: 10 })).toBe("0.000000");
  });

  it("handles invalid values", () => {
    expect(fromBaseUnit("", { decimals: 6 })).toBe("");
    expect(fromBaseUnit("invalid", { decimals: 6 })).toBe("");
    expect(fromBaseUnit(NaN, { decimals: 6 })).toBe("");
  });

  it("handles undefined values", () => {
    expect(fromBaseUnit(undefined, { decimals: 6 })).toBe("");
    expect(fromBaseUnit()).toBe("");
  });

  it("uses custom fallback for invalid values", () => {
    expect(fromBaseUnit(undefined, { decimals: 6, fallback: "0" })).toBe("0");
    expect(fromBaseUnit("", { decimals: 6, fallback: "0" })).toBe("0");
    expect(fromBaseUnit("invalid", { decimals: 6, fallback: "N/A" })).toBe(
      "N/A",
    );
  });
});

describe("toBaseUnit", () => {
  it("converts to base unit", () => {
    expect(toBaseUnit("1.5", { decimals: 6 })).toBe("1500000");
    expect(toBaseUnit("1234.56789", { decimals: 6 })).toBe("1234567890");
    expect(toBaseUnit("0.000001", { decimals: 6 })).toBe("1");
  });

  it("handles negative values", () => {
    expect(toBaseUnit("-1.5", { decimals: 6 })).toBe("-1500000");
    expect(toBaseUnit("-1234.56789", { decimals: 6 })).toBe("-1234567890");
    expect(toBaseUnit("-0.000001", { decimals: 6 })).toBe("-1");
  });

  it("handles zero decimals", () => {
    expect(toBaseUnit("1234.567", { decimals: 0 })).toBe("1234");
    expect(toBaseUnit("1234.9", { decimals: 0 })).toBe("1234");
  });

  it("handles default decimals parameter", () => {
    expect(toBaseUnit("1234.567")).toBe("1234");
    expect(toBaseUnit("1234")).toBe("1234");
  });

  it("handles invalid values", () => {
    expect(toBaseUnit("", { decimals: 6 })).toBe("");
    expect(toBaseUnit("invalid", { decimals: 6 })).toBe("");
    expect(toBaseUnit(NaN, { decimals: 6 })).toBe("");
  });

  it("handles undefined values", () => {
    expect(toBaseUnit(undefined, { decimals: 6 })).toBe("");
    expect(toBaseUnit()).toBe("");
  });

  it("uses custom fallback for invalid values", () => {
    expect(toBaseUnit(undefined, { decimals: 6, fallback: "0" })).toBe("0");
    expect(toBaseUnit("", { decimals: 6, fallback: "0" })).toBe("0");
    expect(toBaseUnit("invalid", { decimals: 6, fallback: "N/A" })).toBe("N/A");
  });

  it("rounds down fractional amounts", () => {
    expect(toBaseUnit("1.9999999", { decimals: 6 })).toBe("1999999");
    expect(toBaseUnit("1.9999999999", { decimals: 6 })).toBe("1999999");
  });
});

describe("formatPercent", () => {
  it("formats percentages", () => {
    expect(formatPercent("0.123")).toBe("12.30%");
    expect(formatPercent("1.23")).toBe("123%");
    expect(formatPercent("0.1234567", { dp: 3 })).toBe("12.345%");
    expect(formatPercent("0.05")).toBe("5.00%");
  });

  it("handles negative percentages", () => {
    expect(formatPercent("-0.123")).toBe("-12.30%");
    expect(formatPercent("-1.23")).toBe("-123.00%");
    expect(formatPercent("-0.05")).toBe("-5.00%");
  });

  it("handles fixed decimal places", () => {
    expect(formatPercent("0.1234567", { dp: 0 })).toBe("12%");
    expect(formatPercent("0.1234567", { dp: 1 })).toBe("12.3%");
    expect(formatPercent("0.1234567", { dp: 5 })).toBe("12.34567%");
  });

  it("auto-adjusts decimal places", () => {
    expect(formatPercent("1")).toBe("100%");
    expect(formatPercent("2.5")).toBe("250%");
    expect(formatPercent("0.99")).toBe("99.00%");
  });

  it("handles invalid values with no fallback", () => {
    expect(formatPercent("")).toBe("");
    expect(formatPercent("invalid")).toBe("");
    expect(formatPercent(NaN)).toBe("");
  });

  it("handles undefined and null values with no fallback", () => {
    expect(formatPercent(undefined)).toBe("");
    expect(formatPercent()).toBe("");
    expect(formatPercent(null as unknown as string)).toBe("");
  });

  it("returns fallback for invalid values when provided", () => {
    expect(formatPercent("", { fallback: "N/A" })).toBe("N/A");
    expect(formatPercent("invalid", { fallback: "N/A" })).toBe("N/A");
    expect(formatPercent(NaN, { fallback: "N/A" })).toBe("N/A");
  });

  it("returns fallback for null and undefined when provided", () => {
    expect(formatPercent(undefined, { fallback: "N/A" })).toBe("N/A");
    expect(formatPercent(null as unknown as string, { fallback: "N/A" })).toBe(
      "N/A",
    );
  });

  it("returns different fallback values", () => {
    expect(formatPercent(null as unknown as string, { fallback: "-" })).toBe(
      "-",
    );
    expect(formatPercent(undefined, { fallback: "No data" })).toBe("No data");
    expect(formatPercent(NaN, { fallback: "Invalid" })).toBe("Invalid");
  });

  it("normal percent formatting remains unchanged for valid numbers", () => {
    expect(formatPercent("0.5", { fallback: "N/A" })).toBe("50.00%");
    expect(formatPercent("1", { fallback: "N/A" })).toBe("100%");
    expect(formatPercent("0.123", { fallback: "N/A", dp: 1 })).toBe("12.3%");
  });

  it("handles percentages >= 100% with no decimal places", () => {
    expect(formatPercent("1")).toBe("100%");
    expect(formatPercent("1.5")).toBe("150%");
    expect(formatPercent("10")).toBe("1000%");
  });

  it("handles percentages < 100% with 2 decimal places by default", () => {
    expect(formatPercent("0.1")).toBe("10.00%");
    expect(formatPercent("0.999")).toBe("99.90%");
    expect(formatPercent("0.001")).toBe("0.10%");
  });
});
