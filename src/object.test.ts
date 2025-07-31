import { describe, it, expect } from "vitest";
import {
  createUserDerivedObjectAddress,
  createObjectAddress,
  getMetadata,
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
        "350045f8766ac3ff7e58ee316786cf1646765f435824345bc9f79d9626c11396",
      );
    });
  });

  describe("createObjectAddress", () => {
    it("should return the correct object address", () => {
      const result = createObjectAddress("0x1", "uinit");
      expect(result).toBe(
        "8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
      );
    });
  });

  describe("getMetadata", () => {
    it("should return the correct metadata for denom 'uinit'", () => {
      const result = getMetadata("uinit");
      expect(result).toBe(
        "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
      );
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
  });
});
