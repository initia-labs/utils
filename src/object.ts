import { bytesToHex } from "viem";
import { toBytes } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha2";
import { sha3_256 } from "@noble/hashes/sha3";
import { InitiaAddress } from "./address";

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

export function denomToMetadata(denom: string): string {
  if (!denom) throw new Error("Denom cannot be empty");
  if (denom.startsWith("move/")) return `0x${denom.replace("move/", "")}`;
  return createObjectAddress("0x1", denom);
}

export function getIbcDenom(channelId: string, denom: string): string {
  if (!channelId) throw new Error("Channel ID cannot be empty");
  if (!denom) throw new Error("Denom cannot be empty");

  const path = `transfer/${channelId}/${denom}`;
  return `ibc/${bytesToHex(sha256(path)).replace("0x", "").toUpperCase()}`;
}
