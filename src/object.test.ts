import { describe, it, expect } from "vitest";
import {
  createUserDerivedObjectAddress,
  createObjectAddress,
  denomToMetadata,
  getIbcDenom,
} from "./object";

describe("object", () => {
  describe("createUserDerivedObjectAddress", () => {
    it("should return the correct derived object address", () => {
      const result = createUserDerivedObjectAddress(
        "0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1",
        "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
      );
      expect(result).toBe(
        "0x350045f8766ac3ff7e58ee316786cf1646765f435824345bc9f79d9626c11396",
      );
    });

    it("should throw error with empty source", () => {
      expect(() =>
        createUserDerivedObjectAddress(
          "",
          "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
        ),
      ).toThrow("Source address cannot be empty");
    });

    it("should throw error with empty derivedFrom", () => {
      expect(() =>
        createUserDerivedObjectAddress(
          "0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1",
          "",
        ),
      ).toThrow("DerivedFrom address cannot be empty");
    });
  });

  describe("createObjectAddress", () => {
    it("should return the correct object address", () => {
      const result = createObjectAddress("0x1", "uinit");
      expect(result).toBe(
        "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
      );
    });

    it("should throw error with empty source", () => {
      expect(() => createObjectAddress("", "uinit")).toThrow(
        "Source address cannot be empty",
      );
    });

    it("should throw error with empty seed", () => {
      expect(() => createObjectAddress("0x1", "")).toThrow(
        "Seed cannot be empty",
      );
    });
  });

  describe("denomToMetadata", () => {
    it("should return the correct metadata for denom 'uinit'", () => {
      const result = denomToMetadata("uinit");
      expect(result).toBe(
        "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
      );
    });

    it("should throw error with empty denom", () => {
      expect(() => denomToMetadata("")).toThrow("Denom cannot be empty");
    });
  });

  describe("getIbcDenom", () => {
    it("should return the correct IBC denom for channel-25 and evm denom", () => {
      const result = getIbcDenom(
        "channel-0",
        "l2/771d639f30fbe45e3fbca954ffbe2fcc26f915f5513c67a4a2d0bc1d635bdefd",
      );
      expect(result).toBe(
        "ibc/82EB1C694C571F954E68BFD68CFCFCD6123B0EBB69AAA8BAB7A082939B45E802",
      );
    });

    it("should throw error with empty channelId", () => {
      expect(() =>
        getIbcDenom(
          "",
          "l2/771d639f30fbe45e3fbca954ffbe2fcc26f915f5513c67a4a2d0bc1d635bdefd",
        ),
      ).toThrow("Channel ID cannot be empty");
    });

    it("should throw error with empty denom", () => {
      expect(() => getIbcDenom("channel-0", "")).toThrow(
        "Denom cannot be empty",
      );
    });
  });
});
