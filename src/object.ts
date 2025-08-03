import { bytesToHex } from "viem";
import { toBytes } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha2";
import { sha3_256 } from "@noble/hashes/sha3";
import { InitiaAddress } from "./address";

/**
 * Removes leading zeros from a hex string while preserving the 0x prefix if present.
 * @param hex - The hex string to process
 * @returns The hex string without leading zeros
 */
export function removeLeadingZeros(hex: string): string {
  const hasPrefix = hex.startsWith("0x");
  const cleanHex = hasPrefix ? hex.slice(2) : hex;

  // Remove leading zeros but keep at least one character
  const trimmed = cleanHex.replace(/^0+/, "") || "0";

  return hasPrefix ? `0x${trimmed}` : trimmed;
}

/**
 * Creates a user-derived object address from a source address and a derivedFrom address.
 * Uses the OBJECT_DERIVED_SCHEME (0xfc) for address generation.
 */
export function createUserDerivedObjectAddress(
  source: string,
  derivedFrom: string,
): string {
  if (!source) throw new Error("Source address cannot be empty");
  if (!derivedFrom) throw new Error("DerivedFrom address cannot be empty");

  const OBJECT_DERIVED_SCHEME = 0xfc;
  const bytes = new Uint8Array([
    ...InitiaAddress(source, 32).bytes,
    ...InitiaAddress(derivedFrom, 32).bytes,
    OBJECT_DERIVED_SCHEME,
  ]);
  return bytesToHex(sha3_256.create().update(bytes).digest());
}

/**
 * Creates an object address from a source address and a seed string.
 * Uses the OBJECT_FROM_SEED_ADDRESS_SCHEME (0xfe) for address generation.
 */
export function createObjectAddress(source: string, seed: string): string {
  if (!source) throw new Error("Source address cannot be empty");
  if (!seed) throw new Error("Seed cannot be empty");

  const OBJECT_FROM_SEED_ADDRESS_SCHEME = 0xfe;
  const bytes = new Uint8Array([
    ...InitiaAddress(source, 32).bytes,
    ...toBytes(seed),
    OBJECT_FROM_SEED_ADDRESS_SCHEME,
  ]);
  return bytesToHex(sha3_256.create().update(bytes).digest());
}

/**
 * Converts a denomination to its metadata address.
 *
 * Currently, denom can be either native (e.g. uinit) or start with prefixes like
 * l2/, ibc/, move/, evm/. Only if denom starts with move/, remove the move/ prefix
 * directly. For all other cases, use the object address generation function.
 * (Technically, tokens starting with evm/ only exist in minievm, so it won't
 * happen in practice. But unsure if we need error handling for that.)
 *
 * @param denom - The denomination string to convert
 * @returns The metadata address as a hex string
 */
export function denomToMetadata(denom: string): string {
  if (!denom) throw new Error("Denom cannot be empty");
  if (denom.startsWith("move/")) {
    return removeLeadingZeros(`0x${denom.replace("move/", "")}`);
  }
  const objectAddress = createObjectAddress("0x1", denom);
  return removeLeadingZeros(objectAddress);
}

/**
 * Generates an IBC denomination hash from a channel ID and base denomination.
 * Returns the IBC denom in the format: ibc/{HASH}
 */
export function getIbcDenom(channelId: string, denom: string): string {
  if (!channelId) throw new Error("Channel ID cannot be empty");
  if (!denom) throw new Error("Denom cannot be empty");

  const path = `transfer/${channelId}/${denom}`;
  return `ibc/${bytesToHex(sha256(path)).replace("0x", "").toUpperCase()}`;
}
