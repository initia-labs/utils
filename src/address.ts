import { getAddress, isAddress } from "viem";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { removeLeadingZeros } from "./object";

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

  /**
   * Converts the address to a byte array representation.
   * Handles both hex and bech32 formats, padding with leading zeros as needed.
   */
  get bytes(): Uint8Array {
    if (this.address.match(/^0x[0-9a-fA-F]+$/)) {
      const addressBytesLength = (this.address.length - 2) / 2;
      const targetLength =
        this.byteLength ?? (addressBytesLength > 20 ? 32 : 20);
      // Pad with leading zeros to reach the target byte length
      // This handles Move addresses that have leading zeros removed (e.g., 0x1 -> 0x0000...0001)
      return hexToBytes(
        this.address.replace("0x", "").padStart(targetLength * 2, "0"),
      );
    }

    const { data } = fromBech32(this.address);
    const targetLength = this.byteLength ?? (data.length > 20 ? 32 : 20);
    const leadingZeros = Math.max(0, targetLength - data.length);
    return new Uint8Array([...Array(leadingZeros).fill(0), ...data]);
  }

  /**
   * Returns the bech32-encoded representation of the address.
   * Uses "init" as the prefix for all addresses.
   */
  get bech32(): string {
    return toBech32("init", this.bytes);
  }

  /**
   * Returns the raw hex string representation without 0x prefix or checksum.
   * Always returns lowercase hex string.
   */
  get rawHex(): string {
    return bytesToHex(this.bytes);
  }

  /**
   * Returns the hex representation with 0x prefix.
   * For 20-byte addresses: returns checksummed address.
   * For 32-byte addresses: returns lowercase hex with leading zeros stripped.
   * For special Move addresses: removes leading zeros (e.g., 0x1).
   */
  get hex(): string {
    const rawHex = this.rawHex;
    if (rawHex === "0000000000000000000000000000000000000001") {
      return "0x1";
    }

    // For 32-byte addresses, strip leading zeros and return with 0x prefix (no checksum)
    if (this.bytes.length === 32) {
      return removeLeadingZeros(`0x${rawHex}`);
    }

    // For 20-byte addresses, use checksum
    return getAddress(`0x${rawHex}`);
  }

  /**
   * Validates whether a string is a valid Initia address.
   * Accepts hex addresses (with or without leading zeros) and bech32 addresses.
   */
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
      const hexCharsCount = address.length - 2; // Remove 0x prefix
      // Accept any hex length up to 64 chars (32 bytes)
      return hexCharsCount > 0 && hexCharsCount <= 64;
    }

    try {
      return fromBech32(address).prefix === "init";
    } catch {
      return false;
    }
  }

  /**
   * Checks if two addresses are equal, regardless of format.
   * Compares the hex representation of both addresses.
   */
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

/**
 * Creates an InitiaAddress instance from a hex or bech32 address string.
 * Supports both 20-byte and 32-byte addresses.
 * @param address - The address string in hex or bech32 format
 * @param byteLength - Optional byte length (20 or 32), auto-detected if not provided
 */
export function InitiaAddress(
  address: string,
  byteLength?: number,
): InitiaAddress {
  return new InitiaAddressImpl(address, byteLength);
}

// Add static methods to the factory function
InitiaAddress.validate = InitiaAddressImpl.validate;
InitiaAddress.equals = InitiaAddressImpl.equals;
