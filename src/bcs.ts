import BigNumber from "bignumber.js";
import { bytesToHex } from "viem";
import type { BcsType, BcsTypeOptions } from "@mysten/bcs";
import { bcs as mystenBcs } from "@mysten/bcs";
import { InitiaAddress } from "./address";

function addressSerializer(
  options?: BcsTypeOptions<Uint8Array, Iterable<number>>,
) {
  return bcs.bytes(32, options).transform({
    input: (value: string) => InitiaAddress(value, 32).bytes,
    output: (value: Uint8Array) => bytesToHex(value),
  });
}

function createFixedPointSerializer(
  scaleFactor: BigNumber,
  bcsType: (
    options?: BcsTypeOptions<string, number | bigint | string>,
  ) => BcsType<string, string | number | bigint>,
) {
  return (options?: BcsTypeOptions<string, string | number | bigint>) =>
    bcsType(options).transform({
      input: (val: number | string) =>
        new BigNumber(val).times(scaleFactor).toFixed(0, BigNumber.ROUND_DOWN),
      output: (val: string) => new BigNumber(val).div(scaleFactor).toNumber(),
    });
}

const SCALE_FACTOR_FIXED_POINT_32 = BigNumber(2).pow(32);
const SCALE_FACTOR_FIXED_POINT_64 = BigNumber(2).pow(64);
const SCALE_FACTOR_DECIMAL_128 = BigNumber(10).pow(18);
const SCALE_FACTOR_DECIMAL_256 = BigNumber(10).pow(18);

const fixedPoint32Serializer = createFixedPointSerializer(
  SCALE_FACTOR_FIXED_POINT_32,
  mystenBcs.u64,
);

const fixedPoint64Serializer = createFixedPointSerializer(
  SCALE_FACTOR_FIXED_POINT_64,
  mystenBcs.u128,
);

const decimal128Serializer = createFixedPointSerializer(
  SCALE_FACTOR_DECIMAL_128,
  mystenBcs.u128,
);

const decimal256Serializer = createFixedPointSerializer(
  SCALE_FACTOR_DECIMAL_256,
  mystenBcs.u256,
);

function bigdecimalSerializer(
  options?: BcsTypeOptions<string, string | number>,
) {
  return bcs.vector(bcs.u8(options)).transform({
    input: (value: string | number) => {
      const number = BigNumber(value)
        .times(BigNumber(10).pow(18))
        .toFixed(0, BigNumber.ROUND_DOWN);
      return toLittleEndian(BigInt(number));
    },
    output: (val) => {
      const number = fromLittleEndian(new Uint8Array(val));
      return BigNumber(number).div(BigNumber(10).pow(18)).toFixed();
    },
  });
}

export const bcs = {
  ...mystenBcs,
  address: addressSerializer,
  object: addressSerializer,
  fixedPoint32: fixedPoint32Serializer,
  fixedPoint64: fixedPoint64Serializer,
  decimal128: decimal128Serializer,
  decimal256: decimal256Serializer,
  bigdecimal: bigdecimalSerializer,
};

/**
 * Recursively resolves a Move-style type string into a bcs type.
 * Handles generic types like option<T> and simplifies module paths.
 * @param typeStr - Move type string (e.g., "0x1::string::String")
 * @returns The corresponding BCS type
 */
export function resolveBcsType(typeStr: string): BcsType<unknown, unknown> {
  const type = typeStr.replaceAll(/0x1::(\w+)::(\w+)/g, "$2").toLowerCase();

  // object<T> - treat as just "object"
  if (type.startsWith("object")) {
    // @ts-expect-error // guaranteed to be a valid bcs.*() function
    return bcs.object();
  }

  // generic - like option<InnerType>
  const genericMatch = type.match(/(\w+)<(.+)>$/);
  if (genericMatch) {
    const [, container, inner] = genericMatch;
    // recurse for the inner type
    const innerBcs = resolveBcsType(inner);
    // invoke the container function on the result
    // @ts-expect-error // guaranteed to be a valid bcs.*() function
    return bcs[container](innerBcs);
  }

  // call the corresponding bcs.*()
  // @ts-expect-error // guaranteed to be a valid bcs.*() function
  return bcs[type]();
}

/**
 * Converts a bigint to little-endian byte array.
 * Used for encoding decimal values in BCS format.
 */
function toLittleEndian(value: bigint): Uint8Array {
  if (value < 0n) {
    throw new Error("negative values are not supported");
  }

  if (value === 0n) {
    return new Uint8Array([0]);
  }

  const bytes: number[] = [];
  let n = value;
  while (n > 0n) {
    bytes.push(Number(n & 0xffn));
    n >>= 8n;
  }
  return new Uint8Array(bytes);
}

/**
 * Converts a little-endian byte array to bigint.
 * Used for decoding decimal values from BCS format.
 */
function fromLittleEndian(bytes: Uint8Array): bigint {
  let result = 0n;
  for (let i = 0; i < bytes.length; i++) {
    result += BigInt(bytes[i]) << BigInt(8 * i);
  }
  return result;
}
