import { getAddress, isAddress } from "viem";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { fromBech32, toBech32 } from "@cosmjs/encoding";

export interface InitiaAddress {
  readonly bech32: string;
  readonly hex: string;
  readonly rawHex: string;
  readonly bytes: Uint8Array;
}

class InitiaAddressImpl implements InitiaAddress {
  constructor(
    private readonly address: string,
    private readonly byteLength?: number,
  ) {
    if (!address) {
      throw new Error("address is required");
    }

    if (!InitiaAddressImpl.validate(address)) {
      throw new Error("invalid address");
    }
  }

  get bytes(): Uint8Array {
    if (this.address.match(/^0x[0-9a-fA-F]+$/)) {
      const hexLength = (this.address.length - 2) / 2;
      const targetByteLength = this.byteLength ?? (hexLength > 20 ? 32 : 20);
      // Pad with leading zeros to reach the target byte length
      // This handles Move addresses that have leading zeros removed (e.g., 0x1 -> 0x0000...0001)
      return hexToBytes(
        this.address.replace("0x", "").padStart(targetByteLength * 2, "0"),
      );
    }

    const { data } = fromBech32(this.address);
    const targetByteLength = this.byteLength ?? (data.length > 20 ? 32 : 20);
    const padding = Math.max(0, targetByteLength - data.length);
    return new Uint8Array([...Array(padding).fill(0), ...data]);
  }

  get bech32(): string {
    return toBech32("init", this.bytes);
  }

  get rawHex(): string {
    return bytesToHex(this.bytes);
  }

  get hex(): string {
    const rawHex = this.rawHex;
    if (rawHex === "0000000000000000000000000000000000000001") {
      return "0x1";
    }

    // Use checksum
    return getAddress(`0x${rawHex}`);
  }

  static validate(address: string): boolean {
    if (!address) {
      return false;
    }

    if (address === "0x1") {
      return true;
    }

    if (isAddress(address)) {
      return true;
    }

    // Check for valid hex format
    // Note: Move addresses can be shorter than 40 or 64 chars because Move removes leading zeros
    // For example, 0x1 is a valid address that represents 0x0000...0001
    if (address.match(/^0x[0-9a-fA-F]+$/)) {
      const hexLength = address.length - 2; // Remove 0x prefix
      // Accept any hex length up to 64 chars (32 bytes)
      return hexLength > 0 && hexLength <= 64;
    }

    try {
      return fromBech32(address).prefix === "init";
    } catch {
      return false;
    }
  }

  static equals(address1: string, address2: string): boolean {
    if (!address1 || !address2) {
      return address1 === address2;
    }

    // Check if both addresses are valid
    if (
      !InitiaAddress.validate(address1) ||
      !InitiaAddress.validate(address2)
    ) {
      return false;
    }

    try {
      return InitiaAddress(address1).hex === InitiaAddress(address2).hex;
    } catch {
      return false;
    }
  }
}

// Factory function that can be called with or without "new"
export function InitiaAddress(
  address: string,
  byteLength?: number,
): InitiaAddress {
  return new InitiaAddressImpl(address, byteLength);
}

// Add static methods to the factory function
InitiaAddress.validate = InitiaAddressImpl.validate;
InitiaAddress.equals = InitiaAddressImpl.equals;
