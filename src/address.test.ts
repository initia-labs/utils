import { describe, it, expect } from "vitest";
import { InitiaAddress } from "./address";

const cases = [
  {
    description: "normal address",
    bech32: "init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs",
    hex: "0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1",
    rawHex: "77d96ae5e7885b19b5bf4e680e129ace8fd58fb1",
  },
  {
    description: "hex with leading zero",
    bech32: "init1prdwrp2kwss8lg854u08vya6uw8t9mldsqchdv",
    hex: "0x08daE1855674207Fa0f4af1e7613bae38eB2eFeD",
    rawHex: "08dae1855674207fa0f4af1e7613bae38eb2efed",
  },
  {
    description: "special address",
    bech32: "init1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqr5e3d",
    hex: "0x1",
    rawHex: "0000000000000000000000000000000000000001",
  },
];

describe("InitiaAddress", () => {
  cases.forEach(({ description, bech32, hex, rawHex }) => {
    describe(description, () => {
      it("should convert to bytes correctly", () => {
        const address = InitiaAddress(bech32);
        expect(address.bytes).toBeInstanceOf(Uint8Array);
        expect(address.bytes.length).toBe(20);
      });

      it("should convert hex to bech32 format correctly", () => {
        const address = InitiaAddress(hex);
        expect(address.bech32).toBe(bech32);
      });

      it("should convert bech32 to hex format correctly", () => {
        const address = InitiaAddress(bech32);
        expect(address.hex).toBe(hex);
      });

      it("should return correct rawHex", () => {
        const address = InitiaAddress(hex);
        expect(address.rawHex).toBe(rawHex);
      });

      it("should recognize valid bech32 address", () => {
        expect(InitiaAddress.validate(bech32)).toBe(true);
      });

      it("should recognize valid hex address", () => {
        expect(InitiaAddress.validate(hex)).toBe(true);
      });

      it("should recognize equal addresses", () => {
        expect(InitiaAddress.equals(bech32, hex)).toBe(true);
      });
    });
  });

  it("should throw error for empty address", () => {
    expect(() => InitiaAddress("")).toThrow("address is required");
  });

  it("should throw error for invalid address", () => {
    expect(() => InitiaAddress("invalid-address")).toThrow("invalid address");
  });

  it("should support custom byte length in constructor", () => {
    const address = InitiaAddress("0x1", 32);
    expect(address.bytes).toBeInstanceOf(Uint8Array);
    expect(address.bytes.length).toBe(32);
  });

  it("should not validate invalid addresses", () => {
    expect(InitiaAddress.validate("")).toBe(false);
    expect(InitiaAddress.validate("invalid-address")).toBe(false);
    expect(InitiaAddress.validate("init1invalid")).toBe(false);
  });

  it("should handle edge cases in equals method", () => {
    // Empty addresses
    expect(InitiaAddress.equals("", "")).toBe(true);
    expect(InitiaAddress.equals("0x1", "")).toBe(false);
    expect(InitiaAddress.equals("", "0x1")).toBe(false);

    // Invalid addresses
    expect(InitiaAddress.equals("invalid1", "invalid2")).toBe(false);
  });

  it("should support destructuring", () => {
    const { bech32, hex, rawHex, bytes } = InitiaAddress(
      "0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1",
    );
    expect(bech32).toBe("init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs");
    expect(hex).toBe("0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1");
    expect(rawHex).toBe("77d96ae5e7885b19b5bf4e680e129ace8fd58fb1");
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(20);
  });

  it("should support 32-byte hex addresses", () => {
    const address = InitiaAddress(
      "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
    );
    expect(address.bech32).toBe(
      "init13ern80dtea754lpazncd63kfhaf0kr7wne9ejmynncv4hz7gj8vs6rnj5j",
    );
    expect(address.hex).toBe(
      "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
    );
    expect(address.rawHex).toBe(
      "8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
    );
    expect(address.bytes.length).toBe(32);
  });

  it("should support Move addresses with various leading zero patterns", () => {
    // The 0x1 case is already covered in parameterized tests
    // Test another example with leading zeros removed
    const address = InitiaAddress("0xabc");
    expect(address.rawHex).toBe("0000000000000000000000000000000000000abc");
    expect(address.bytes.length).toBe(20);
  });

  it("should handle lowercase 20-byte hex addresses", () => {
    const address = InitiaAddress("0x77d96ae5e7885b19b5bf4e680e129ace8fd58fb1");
    expect(address.bech32).toBe("init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs");
    expect(address.hex).toBe("0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1"); // Checksummed
    expect(address.rawHex).toBe("77d96ae5e7885b19b5bf4e680e129ace8fd58fb1");
    expect(address.bytes.length).toBe(20);
  });

  it("should handle lowercase 32-byte hex addresses", () => {
    const address = InitiaAddress(
      "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
    );
    expect(address.bech32).toBe(
      "init13ern80dtea754lpazncd63kfhaf0kr7wne9ejmynncv4hz7gj8vs6rnj5j",
    );
    expect(address.hex).toBe(
      "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
    ); // 32-byte addresses are not checksummed
    expect(address.rawHex).toBe(
      "8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
    );
    expect(address.bytes.length).toBe(32);
  });

  it("should strip leading zeros from 32-byte hex addresses", () => {
    const address = InitiaAddress(
      "init1pfnzlegnrh9u2vdft7rxgdhx7krxytg6fk7s8upwjh5u25z073ns0k5njh",
    );
    expect(address.hex).toBe(
      "0xa662fe5131dcbc531a95f866436e6f586622d1a4dbd03f02e95e9c5504ff467",
    );
    expect(address.rawHex).toBe(
      "0a662fe5131dcbc531a95f866436e6f586622d1a4dbd03f02e95e9c5504ff467",
    );
    expect(address.bytes.length).toBe(32);
  });
});
