import BigNumber from "bignumber.js";

interface FormatNumberOptions {
  dp?: number;
  abbr?: boolean;
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

export function formatNumber(
  value?: number | string | BigNumber,
  options?: FormatNumberOptions,
): string {
  const { dp = 2, abbr = false } = options || {};

  if (!value) {
    return "0";
  }

  try {
    const num = new BigNumber(value);

    if (num.isNaN() || !num.isFinite()) {
      return "0";
    }

    if (num.isZero()) {
      return "0";
    }

    if (abbr) {
      const absNum = num.abs();
      const isNegative = num.isNegative();

      for (const { value: threshold, suffix } of ABBREVIATIONS) {
        if (absNum.gte(threshold)) {
          const abbreviated = absNum.div(threshold);
          const formatted = abbreviated.toFormat(dp, BigNumber.ROUND_DOWN);
          return isNegative
            ? `-${formatted}${suffix}`
            : `${formatted}${suffix}`;
        }
      }
    }

    const formatted = num.decimalPlaces(dp, BigNumber.ROUND_DOWN);
    return formatted.toFormat();
  } catch {
    return "0";
  }
}

export function formatAmount(
  value?: number | string | BigNumber,
  options?: FormatAmountOptions,
): string {
  if (!value) {
    return "0";
  }

  const { decimals = 0, dp } = options || {};

  try {
    const num = new BigNumber(value);

    if (num.isNaN() || !num.isFinite()) {
      return "0";
    }

    const divisor = new BigNumber(10).pow(decimals);
    const result = num.div(divisor);

    const decimalPlaces = dp !== undefined ? dp : Math.min(decimals, 6);

    // When dp is not specified and decimals > 0, preserve trailing zeros
    if (
      dp === undefined &&
      decimals > 0 &&
      decimalPlaces > 0 &&
      !options?.abbr
    ) {
      // Use toFixed to preserve trailing zeros, then add commas
      const fixed = result.toFixed(decimalPlaces, BigNumber.ROUND_DOWN);
      const parts = fixed.split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts[1] ? `${integerPart}.${parts[1]}` : integerPart;
    }

    return formatNumber(result, { dp: decimalPlaces, abbr: options?.abbr });
  } catch {
    return "0";
  }
}

export function fromBaseUnit(
  value?: number | string | BigNumber,
  decimals = 6,
): string {
  if (!value) {
    return "0";
  }

  try {
    const num = new BigNumber(value);

    if (num.isNaN() || !num.isFinite()) {
      return "0";
    }

    const divisor = new BigNumber(10).pow(decimals);
    const result = num.div(divisor);

    const decimalPlaces = Math.min(decimals, 6);

    return result.toFixed(decimalPlaces, BigNumber.ROUND_DOWN);
  } catch {
    return "0";
  }
}

export function toBaseUnit(
  value?: number | string | BigNumber,
  decimals = 6,
): string {
  if (!value) {
    return "0";
  }

  try {
    const num = new BigNumber(value);

    if (num.isNaN() || !num.isFinite()) {
      return "0";
    }

    const multiplier = new BigNumber(10).pow(decimals);
    const result = num.times(multiplier);

    return result.integerValue(BigNumber.ROUND_DOWN).toString();
  } catch {
    return "0";
  }
}

export function formatPercent(
  value?: number | string | BigNumber,
  dp?: number,
): string {
  if (!value) {
    return "0%";
  }

  try {
    const num = new BigNumber(value);

    if (num.isNaN() || !num.isFinite()) {
      return "0%";
    }

    const percentage = num.times(100);

    const decimalPlaces = dp !== undefined ? dp : percentage.gte(100) ? 0 : 2;

    return `${percentage.toFixed(decimalPlaces, BigNumber.ROUND_DOWN)}%`;
  } catch {
    return "0%";
  }
}
