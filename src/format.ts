import BigNumber from "bignumber.js";

interface FormatNumberOptions {
  dp?: number;
  abbr?: boolean;
  fallback?: string;
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

export function formatNumber(
  value?: number | string | bigint | BigNumber,
  options?: FormatNumberOptions,
): string {
  const { dp = 2, abbr = false, fallback = "" } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;
  if (num.isZero()) return "0";

  if (!abbr) {
    return num.decimalPlaces(dp, BigNumber.ROUND_DOWN).toFormat();
  }

  const absNum = num.abs();
  const isNegative = num.isNegative();

  for (const { value: threshold, suffix } of ABBREVIATIONS) {
    if (absNum.gte(threshold)) {
      const abbreviated = absNum.div(threshold);
      const formatted = abbreviated.toFormat(dp, BigNumber.ROUND_DOWN);
      return isNegative ? `-${formatted}${suffix}` : `${formatted}${suffix}`;
    }
  }

  return num.decimalPlaces(dp, BigNumber.ROUND_DOWN).toFormat();
}

export function formatAmount(
  value?: number | string | bigint | BigNumber,
  options?: FormatAmountOptions,
): string {
  const { decimals = 0, dp, abbr, fallback = "" } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;
  if (num.isZero()) return "0";

  const result = num.div(getPowerOf10(decimals));
  const decimalPlaces = dp !== undefined ? dp : Math.min(decimals, 6);

  // When dp is not specified and decimals > 0, preserve trailing zeros
  if (dp === undefined && decimals > 0 && decimalPlaces > 0 && !abbr) {
    const fixed = result.toFixed(decimalPlaces, BigNumber.ROUND_DOWN);
    return addCommas(fixed);
  }

  return formatNumber(result, { dp: decimalPlaces, abbr });
}

interface FromBaseUnitOptions {
  decimals?: number;
  fallback?: string;
}

export function fromBaseUnit(
  value?: number | string | bigint | BigNumber,
  options?: FromBaseUnitOptions,
): string {
  const { decimals = 0, fallback = "" } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;

  const result = num.div(getPowerOf10(decimals));
  const decimalPlaces = Math.min(decimals, 6);

  return result.toFixed(decimalPlaces, BigNumber.ROUND_DOWN);
}

interface ToBaseUnitOptions {
  decimals?: number;
  fallback?: string;
}

export function toBaseUnit(
  value?: number | string | bigint | BigNumber,
  options?: ToBaseUnitOptions,
): string {
  const { decimals = 0, fallback = "" } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;

  const result = num.times(getPowerOf10(decimals));
  return result.integerValue(BigNumber.ROUND_DOWN).toString();
}

interface FormatPercentOptions {
  dp?: number;
  fallback?: string;
}

export function formatPercent(
  value?: number | string | bigint | BigNumber,
  options?: FormatPercentOptions,
): string {
  const { dp, fallback = "" } = options || {};

  const num = toBigNumber(value);
  if (!num) return fallback;

  const percentage = num.times(100);
  const decimalPlaces = dp !== undefined ? dp : percentage.gte(100) ? 0 : 2;

  return `${percentage.toFixed(decimalPlaces, BigNumber.ROUND_DOWN)}%`;
}
