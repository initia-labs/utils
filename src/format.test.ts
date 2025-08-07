import { describe, it, expect } from "vitest";
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

  it("handles bigint values", () => {
    expect(formatNumber(BigInt(1234))).toBe("1,234");
    expect(formatNumber(BigInt(-5678))).toBe("-5,678");
    expect(formatNumber(BigInt(1234567), { abbr: true })).toBe("1.23M");
    expect(formatNumber(BigInt("9007199254740993"))).toBe(
      "9,007,199,254,740,993",
    );
  });

  it("preserves trailing zeros when dp is specified", () => {
    expect(formatNumber("46.6", { dp: 2 })).toBe("46.60");
    expect(formatNumber("1", { dp: 3 })).toBe("1.000");
    expect(formatNumber("12.3", { dp: 4 })).toBe("12.3000");
    expect(formatNumber("0.5", { dp: 2 })).toBe("0.50");
    expect(formatNumber("100", { dp: 1 })).toBe("100.0");

    // Test with numbers > 1000 (with comma separators)
    expect(formatNumber("1234.5", { dp: 2 })).toBe("1,234.50");
    expect(formatNumber("10000", { dp: 3 })).toBe("10,000.000");
    expect(formatNumber("999999.9", { dp: 4 })).toBe("999,999.9000");
    expect(formatNumber("1234567.89", { dp: 1 })).toBe("1,234,567.8"); // ROUND_DOWN by default
    expect(formatNumber("1000000", { dp: 2 })).toBe("1,000,000.00");
  });

  it("handles custom rounding modes", () => {
    // Default is ROUND_DOWN
    expect(formatNumber("1.236", { dp: 2 })).toBe("1.23");
    expect(formatNumber("1.234", { dp: 2 })).toBe("1.23");

    // ROUND_UP
    expect(
      formatNumber("1.234", { dp: 2, roundingMode: BigNumber.ROUND_UP }),
    ).toBe("1.24");
    expect(
      formatNumber("1.231", { dp: 2, roundingMode: BigNumber.ROUND_UP }),
    ).toBe("1.24");

    // ROUND_HALF_UP
    expect(
      formatNumber("1.235", { dp: 2, roundingMode: BigNumber.ROUND_HALF_UP }),
    ).toBe("1.24");
    expect(
      formatNumber("1.234", { dp: 2, roundingMode: BigNumber.ROUND_HALF_UP }),
    ).toBe("1.23");

    // Works with abbreviations
    expect(
      formatNumber("1234.567", {
        abbr: true,
        dp: 2,
        roundingMode: BigNumber.ROUND_UP,
      }),
    ).toBe("1.24K");
    expect(
      formatNumber("1234.567", {
        abbr: true,
        dp: 2,
        roundingMode: BigNumber.ROUND_DOWN,
      }),
    ).toBe("1.23K");
  });
});

describe("formatAmount", () => {
  it("formats amounts with decimals", () => {
    expect(formatAmount("1234567890", { decimals: 6 })).toBe("1,234.567890");
    expect(formatAmount("1234567890", { decimals: 6, dp: 3 })).toBe(
      "1,234.567",
    );
    expect(formatAmount("1000000", { decimals: 6 })).toBe("1.000000");
    expect(formatAmount("0", { decimals: 6 })).toBe("0");
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

  it("handles bigint values", () => {
    expect(formatAmount(BigInt("1234567890"), { decimals: 6 })).toBe(
      "1,234.567890",
    );
    expect(formatAmount(BigInt("-1000000"), { decimals: 6 })).toBe("-1.000000");
    expect(
      formatAmount(BigInt("1234567890000"), { decimals: 6, abbr: true }),
    ).toBe("1.234567M");
  });

  it("preserves trailing zeros when dp is specified", () => {
    expect(formatAmount("1234567890", { decimals: 6, dp: 2 })).toBe("1,234.56");
    expect(formatAmount("1000000000", { decimals: 6, dp: 3 })).toBe(
      "1,000.000",
    );
    expect(formatAmount("5500000", { decimals: 6, dp: 4 })).toBe("5.5000");
    expect(formatAmount("123000000", { decimals: 6, dp: 1 })).toBe("123.0");

    // Test with large amounts
    expect(formatAmount("1234567890000000", { decimals: 6, dp: 2 })).toBe(
      "1,234,567,890.00",
    );
    expect(formatAmount("999999999000000", { decimals: 6, dp: 5 })).toBe(
      "999,999,999.00000",
    );
  });

  it("handles custom rounding modes", () => {
    // Default is ROUND_DOWN
    expect(formatAmount("1234567896", { decimals: 6, dp: 5 })).toBe(
      "1,234.56789",
    );

    // ROUND_UP
    expect(
      formatAmount("1234567896", {
        decimals: 6,
        dp: 5,
        roundingMode: BigNumber.ROUND_UP,
      }),
    ).toBe("1,234.56790");

    // ROUND_HALF_UP
    expect(
      formatAmount("1234567895", {
        decimals: 6,
        dp: 5,
        roundingMode: BigNumber.ROUND_HALF_UP,
      }),
    ).toBe("1,234.56790");

    // Works with auto-dp when not specified
    expect(
      formatAmount("1234567896", {
        decimals: 6,
        roundingMode: BigNumber.ROUND_UP,
      }),
    ).toBe("1,234.567896");
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

  it("handles bigint values", () => {
    expect(fromBaseUnit(BigInt("1234567890"), { decimals: 6 })).toBe(
      "1234.567890",
    );
    expect(fromBaseUnit(BigInt("-1000000"), { decimals: 6 })).toBe("-1.000000");
    expect(fromBaseUnit(BigInt("1234567890123456789"), { decimals: 18 })).toBe(
      "1.234567",
    );
  });

  it("handles custom rounding modes", () => {
    // Default is ROUND_DOWN
    expect(fromBaseUnit("1234567896", { decimals: 6 })).toBe("1234.567896");

    // ROUND_UP (note: toFixed with limited decimals)
    expect(
      fromBaseUnit("1234567896123456789", {
        decimals: 18,
        roundingMode: BigNumber.ROUND_UP,
      }),
    ).toBe("1.234568");
    expect(
      fromBaseUnit("1234567890123456789", {
        decimals: 18,
        roundingMode: BigNumber.ROUND_DOWN,
      }),
    ).toBe("1.234567");

    // ROUND_HALF_UP
    expect(
      fromBaseUnit("1234567895000000000", {
        decimals: 18,
        roundingMode: BigNumber.ROUND_HALF_UP,
      }),
    ).toBe("1.234568");
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

  it("handles bigint values", () => {
    expect(toBaseUnit(BigInt(1500), { decimals: 3 })).toBe("1500000");
    expect(toBaseUnit(BigInt(-1234), { decimals: 6 })).toBe("-1234000000");
    expect(toBaseUnit(BigInt(0), { decimals: 18 })).toBe("0");
  });

  it("handles custom rounding modes", () => {
    // Default is ROUND_DOWN
    expect(toBaseUnit("1.9999999", { decimals: 6 })).toBe("1999999");

    // ROUND_UP
    expect(
      toBaseUnit("1.9999999", {
        decimals: 6,
        roundingMode: BigNumber.ROUND_UP,
      }),
    ).toBe("2000000");
    expect(
      toBaseUnit("1.0000001", {
        decimals: 6,
        roundingMode: BigNumber.ROUND_UP,
      }),
    ).toBe("1000001");

    // ROUND_HALF_UP
    expect(
      toBaseUnit("1.5000005", {
        decimals: 6,
        roundingMode: BigNumber.ROUND_HALF_UP,
      }),
    ).toBe("1500001");
    expect(
      toBaseUnit("1.4999994", {
        decimals: 6,
        roundingMode: BigNumber.ROUND_HALF_UP,
      }),
    ).toBe("1499999");

    // Negative values
    expect(
      toBaseUnit("-1.9999999", {
        decimals: 6,
        roundingMode: BigNumber.ROUND_UP,
      }),
    ).toBe("-2000000");
    expect(
      toBaseUnit("-1.9999999", {
        decimals: 6,
        roundingMode: BigNumber.ROUND_DOWN,
      }),
    ).toBe("-1999999");
  });

  it("handles large numbers with zero decimals", () => {
    expect(toBaseUnit("988288776786168845847765", { decimals: 0 })).toBe(
      "988288776786168845847765",
    );
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

  it("handles bigint values", () => {
    expect(formatPercent(BigInt(1))).toBe("100%");
    expect(formatPercent(BigInt(0))).toBe("0.00%");
    expect(formatPercent(BigInt(-1))).toBe("-100.00%");
  });

  it("preserves trailing zeros when dp is specified", () => {
    expect(formatPercent("0.1", { dp: 2 })).toBe("10.00%");
    expect(formatPercent("0.5", { dp: 3 })).toBe("50.000%");
    expect(formatPercent("0.123", { dp: 4 })).toBe("12.3000%");
    expect(formatPercent("1", { dp: 1 })).toBe("100.0%");
    expect(formatPercent("0.466", { dp: 2 })).toBe("46.60%");

    // Test with large percentages (> 100%)
    expect(formatPercent("10", { dp: 2 })).toBe("1000.00%");
    expect(formatPercent("12.345", { dp: 3 })).toBe("1234.500%");
    expect(formatPercent("100", { dp: 1 })).toBe("10000.0%");
    expect(formatPercent("999.99", { dp: 4 })).toBe("99999.0000%");
  });

  it("handles custom rounding modes", () => {
    // Default is ROUND_DOWN
    expect(formatPercent("0.12346", { dp: 2 })).toBe("12.34%");

    // ROUND_UP
    expect(
      formatPercent("0.12341", { dp: 2, roundingMode: BigNumber.ROUND_UP }),
    ).toBe("12.35%");
    expect(
      formatPercent("0.12340", { dp: 2, roundingMode: BigNumber.ROUND_UP }),
    ).toBe("12.34%");

    // ROUND_HALF_UP
    expect(
      formatPercent("0.12345", {
        dp: 2,
        roundingMode: BigNumber.ROUND_HALF_UP,
      }),
    ).toBe("12.35%");
    expect(
      formatPercent("0.12344", {
        dp: 2,
        roundingMode: BigNumber.ROUND_HALF_UP,
      }),
    ).toBe("12.34%");

    // Auto-dp with rounding modes
    expect(formatPercent("0.99996", { roundingMode: BigNumber.ROUND_UP })).toBe(
      "100.00%",
    );
    expect(
      formatPercent("0.99996", { roundingMode: BigNumber.ROUND_DOWN }),
    ).toBe("99.99%");
    expect(formatPercent("1.00001", { roundingMode: BigNumber.ROUND_UP })).toBe(
      "101%",
    );
    expect(
      formatPercent("1.00001", { roundingMode: BigNumber.ROUND_DOWN }),
    ).toBe("100%");
  });
});
