import { describe, it, expect } from "vitest";
import { AddressUtils } from "./address";

const cases = [
  {
    description: "normal address",
    bech32: "init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs",
    hex: "0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1",
    plainHex: "77d96ae5e7885b19b5bf4e680e129ace8fd58fb1",
  },
  {
    description: "hex with leading zero",
    bech32: "init1prdwrp2kwss8lg854u08vya6uw8t9mldsqchdv",
    hex: "0x08daE1855674207Fa0f4af1e7613bae38eB2eFeD",
    plainHex: "08dae1855674207fa0f4af1e7613bae38eb2efed",
  },
  {
    description: "special address",
    bech32: "init1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqr5e3d",
    hex: "0x1",
    plainHex: "0000000000000000000000000000000000000001",
  },
];

describe("Address module", () => {
  cases.forEach(({ description, bech32, hex, plainHex }) => {
    describe(description, () => {
      it("should convert hex to bech32 format correctly", () => {
        expect(AddressUtils.toBech32(hex)).toBe(bech32);
      });

      it("should convert bech32 to hex format correctly", () => {
        expect(AddressUtils.toHex(bech32)).toBe(hex);
      });

      it("should convert bech32 to plain hex format correctly", () => {
        expect(AddressUtils.toPlainHex(bech32)).toBe(plainHex);
      });

      it("should recognize valid bech32 address", () => {
        expect(AddressUtils.validate(bech32)).toBe(true);
      });

      it("should recognize valid hex address", () => {
        expect(AddressUtils.validate(hex)).toBe(true);
      });

      it("should recognize equal addresses", () => {
        expect(AddressUtils.equals(bech32, hex)).toBe(true);
      });
    });
  });
});
