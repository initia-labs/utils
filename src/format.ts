import BigNumber from "bignumber.js";

interface FormatNumberOptions {
  dp?: number;
  abbr?: boolean;
  fallback?: string;
  roundingMode?: BigNumber.RoundingMode;
}

interface FormatAmountOptions extends FormatNumberOptions {
  decimals?: number;
}

const ABBREVIATIONS = [
  { value: 1e12, suffix: "T" },
  { value: 1e9, suffix: "B" },
  { value: 1e6, suffix: "M" },
  { value: 1e3, suffix: "K" },
];

// Helper function to safely convert value to BigNumber
function toBigNumber(
  value: number | string | bigint | BigNumber | null | undefined,
): BigNumber | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  try {
    const num = new BigNumber(value.toString());
    return num.isNaN() || !num.isFinite() ? null : num;
  } catch {
    return null;
  }
}

// Helper function to get power of 10
function getPowerOf10(exponent: number): BigNumber {
  return new BigNumber(10).pow(exponent);
}

// Helper function to format number with commas
function addCommas(value: string): string {
  const parts = value.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts[1] ? `${integerPart}.${parts[1]}` : integerPart;
}

// Helper function to format with or without trailing zeros
function formatWithPrecision(
  num: BigNumber,
  dp: number,
  roundingMode: BigNumber.RoundingMode,
  preserveTrailingZeros: boolean,
): string {
  if (preserveTrailingZeros) {
    const fixed = num.toFixed(dp, roundingMode);
    return addCommas(fixed);
  }
  return num.decimalPlaces(dp, roundingMode).toFormat();
}

/**
 * Formats a number with optional abbreviation (K, M, B, T) and decimal places.
 * @param value - The value to format
 * @param options - Formatting options (dp: decimal places, abbr: abbreviate, fallback: default value, roundingMode: rounding mode)
 */
export function formatNumber(
  value?: number | string | bigint | BigNumber,
  options?: FormatNumberOptions,
): string {
  const {
    dp = 2,
    abbr = false,
    fallback = "",
    roundingMode = BigNumber.ROUND_DOWN,
  } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;
  if (num.isZero()) return "0";

  // Check if dp was explicitly provided to determine trailing zero preservation
  const preserveTrailingZeros = options?.dp !== undefined;

  if (!abbr) {
    return formatWithPrecision(num, dp, roundingMode, preserveTrailingZeros);
  }

  const absNum = num.abs();
  const isNegative = num.isNegative();

  for (const { value: threshold, suffix } of ABBREVIATIONS) {
    if (absNum.gte(threshold)) {
      const abbreviated = absNum.div(threshold);
      const formatted = abbreviated.toFormat(dp, roundingMode);
      return isNegative ? `-${formatted}${suffix}` : `${formatted}${suffix}`;
    }
  }

  return formatWithPrecision(num, dp, roundingMode, preserveTrailingZeros);
}

/**
 * Formats an amount by converting from base units to display units.
 * Applies decimal conversion before formatting.
 * @param value - The amount in base units
 * @param options - Formatting options including decimals for unit conversion and roundingMode
 */
export function formatAmount(
  value?: number | string | bigint | BigNumber,
  options?: FormatAmountOptions,
): string {
  const {
    decimals = 0,
    dp,
    abbr,
    fallback = "",
    roundingMode = BigNumber.ROUND_DOWN,
  } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;
  if (num.isZero()) return "0";

  const result = num.div(getPowerOf10(decimals));
  const decimalPlaces = dp !== undefined ? dp : Math.min(decimals, 6);

  // Determine if trailing zeros should be preserved
  // - When dp is explicitly specified: always preserve
  // - When decimals > 0 and not abbreviated: preserve
  const preserveTrailingZeros = dp !== undefined || (decimals > 0 && !abbr);

  if (!abbr && preserveTrailingZeros) {
    const fixed = result.toFixed(decimalPlaces, roundingMode);
    return addCommas(fixed);
  }

  return formatNumber(result, { dp: decimalPlaces, abbr, roundingMode });
}

interface FromBaseUnitOptions {
  decimals?: number;
  fallback?: string;
  roundingMode?: BigNumber.RoundingMode;
}

/**
 * Converts a value from base units to display units.
 * Always returns a fixed decimal string without abbreviation.
 * @param value - The value in base units
 * @param options - Options including decimals, fallback value, and roundingMode
 */
export function fromBaseUnit(
  value?: number | string | bigint | BigNumber,
  options?: FromBaseUnitOptions,
): string {
  const {
    decimals = 0,
    fallback = "",
    roundingMode = BigNumber.ROUND_DOWN,
  } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;

  const result = num.div(getPowerOf10(decimals));
  const decimalPlaces = Math.min(decimals, 6);

  return result.toFixed(decimalPlaces, roundingMode);
}

interface ToBaseUnitOptions {
  decimals?: number;
  fallback?: string;
  roundingMode?: BigNumber.RoundingMode;
}

/**
 * Converts a value from display units to base units.
 * Returns an integer string representation.
 * @param value - The value in display units
 * @param options - Options including decimals, fallback value, and roundingMode
 */
export function toBaseUnit(
  value?: number | string | bigint | BigNumber,
  options?: ToBaseUnitOptions,
): string {
  const {
    decimals = 0,
    fallback = "",
    roundingMode = BigNumber.ROUND_DOWN,
  } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;

  const result = num.times(getPowerOf10(decimals));
  return result.integerValue(roundingMode).toFixed();
}

interface FormatPercentOptions {
  dp?: number;
  fallback?: string;
  roundingMode?: BigNumber.RoundingMode;
}

/**
 * Formats a decimal value as a percentage.
 * Multiplies by 100 and adds % suffix.
 * Auto-adjusts decimal places: 0 for values >= 100%, 2 otherwise.
 * @param value - The decimal value (e.g., 0.15 for 15%)
 * @param options - Options including decimal places, fallback value, and roundingMode
 */
export function formatPercent(
  value?: number | string | bigint | BigNumber,
  options?: FormatPercentOptions,
): string {
  const {
    dp,
    fallback = "",
    roundingMode = BigNumber.ROUND_DOWN,
  } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;

  const percentage = num.times(100);
  const decimalPlaces = dp !== undefined ? dp : percentage.gte(100) ? 0 : 2;

  // Percentages always use toFixed to maintain consistent decimal places
  // This ensures "10.00%" instead of "10%" for better readability
  return `${percentage.toFixed(decimalPlaces, roundingMode)}%`;
}
