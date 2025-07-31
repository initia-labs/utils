import { bytesToHex, toBytes } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha2";
import { sha3_256 } from "@noble/hashes/sha3";
import { AddressUtils } from "./address";

export function createUserDerivedObjectAddress(
  source: string,
  derivedFrom: string,
): string {
  const OBJECT_DERIVED_SCHEME = 0xfc;
  const bytes = new Uint8Array([
    ...AddressUtils.toBytes(source, 32),
    ...AddressUtils.toBytes(derivedFrom, 32),
    OBJECT_DERIVED_SCHEME,
  ]);
  return bytesToHex(sha3_256.create().update(bytes).digest());
}

export function createObjectAddress(source: string, seed: string): string {
  const OBJECT_FROM_SEED_ADDRESS_SCHEME = 0xfe;
  const bytes = new Uint8Array([
    ...AddressUtils.toBytes(source, 32),
    ...toBytes(seed),
    OBJECT_FROM_SEED_ADDRESS_SCHEME,
  ]);
  return bytesToHex(sha3_256.create().update(bytes).digest());
}

export function getMetadata(denom: string): string {
  if (!denom) return "";
  if (denom.startsWith("move/")) return `0x${denom.slice(5)}`;
  return `0x${createObjectAddress("0x1", denom)}`;
}

export function getIbcDenom(channelId: string, denom: string): string {
  const path = `transfer/${channelId}/${denom}`;
  return `ibc/${bytesToHex(sha256(path)).toUpperCase()}`;
}
