import { describe, it, expect } from "vitest";
import { truncate } from "./text";

describe("truncate", () => {
  it("should truncate a long string with default lengths [6, 6]", () => {
    const input = "init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs";
    const expected = "init1w...gu9xfs";
    expect(truncate(input)).toBe(expected);
  });

  it("should truncate a long string with custom lengths [3, 3]", () => {
    const input = "init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs";
    const expected = "ini...xfs";
    expect(truncate(input, [3, 3])).toBe(expected);
  });

  it("should not truncate strings shorter than or equal to the combined length", () => {
    const shortString = "short";
    expect(truncate(shortString)).toBe("short");

    // With default [6, 6], min length is 15 (6 + 3 + 6)
    const fifteenChars = "123456789012345"; // exactly 15 characters
    expect(truncate(fifteenChars)).toBe("123456789012345");

    // With [3, 3], min length is 9 (3 + 3 + 3)
    const nineChars = "123456789"; // exactly 9 characters
    expect(truncate(nineChars, [3, 3])).toBe("123456789");
  });

  it("should handle edge cases", () => {
    expect(truncate("")).toBe("");
    expect(truncate("a")).toBe("a");
    expect(truncate("ab", [1, 1])).toBe("ab");
  });
});
