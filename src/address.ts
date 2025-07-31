import { getAddress, isAddress } from "viem";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { fromBech32, toBech32 } from "@cosmjs/encoding";

export const AddressUtils = {
  toBytes(address: string, byteLength: number = 20): Uint8Array {
    if (!address) {
      throw new Error("address is required");
    }

    if (address.match(/^0x[0-9a-fA-F]+$/)) {
      return hexToBytes(
        address.replace("0x", "").padStart(byteLength * 2, "0"),
      );
    }

    const { data } = fromBech32(address);
    const padding = Math.max(0, byteLength - data.length);
    return new Uint8Array([...Array(padding).fill(0), ...data]);
  },

  toBech32(address: string, prefix: string = "init"): string {
    if (!address) return "";
    return toBech32(prefix, AddressUtils.toBytes(address));
  },

  toPlainHex(address: string): string {
    if (!address) return "";
    return bytesToHex(AddressUtils.toBytes(address));
  },

  toHex(address: string): string {
    if (!address) return "";
    const hex = AddressUtils.toPlainHex(address);
    if (hex === "0000000000000000000000000000000000000001") {
      return "0x1";
    }
    return getAddress(`0x${hex}`);
  },

  validate(address: string, prefix: string = "init"): boolean {
    if (address === "0x1") {
      return true;
    }

    if (isAddress(address)) {
      return true;
    }

    try {
      return fromBech32(address).prefix === prefix;
    } catch {
      return false;
    }
  },

  equals(address1: string, address2: string): boolean {
    return AddressUtils.toHex(address1) === AddressUtils.toHex(address2);
  },
};
