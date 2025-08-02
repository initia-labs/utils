# @initia/utils

A TypeScript utility library for blockchain applications.

## Installation

```bash
npm install @initia/utils
# or
yarn add @initia/utils
# or
pnpm add @initia/utils
```

## Usage

### Text Utilities

```typescript
import { truncate } from "@initia/utils";

// Truncate long strings (useful for addresses)
truncate("0x1234567890abcdef1234567890abcdef12345678");
// "0x1234...345678"

// Custom truncation lengths
truncate("long_string_here", [3, 4]);
// "lon...here"
```

### Number Formatting

```typescript
import { formatNumber, formatAmount, formatPercent } from "@initia/utils";

// Basic number formatting
formatNumber("1234.567"); // "1,234.56"
formatNumber("1234.567", { dp: 3 }); // "1,234.567"
formatNumber("1234.567", { dp: 0 }); // "1,234"

// With abbreviations
formatNumber("1234", { abbr: true }); // "1.23K"
formatNumber("1234567", { abbr: true }); // "1.23M"
formatNumber("1234567890", { abbr: true }); // "1.23B"
formatNumber("1234567890123", { abbr: true }); // "1.23T"

// Format blockchain amounts (converts from base units)
formatAmount("1000000", { decimals: 6 }); // "1.000000"
formatAmount("1234567890", { decimals: 6 }); // "1,234.567890"
formatAmount("1234567890", { decimals: 6, dp: 3 }); // "1,234.567"
formatAmount("1234567890", { decimals: 6, abbr: true }); // "1.234567K"

// Percentage formatting
formatPercent("0.123"); // "12.30%"
formatPercent("1.23"); // "123%"
formatPercent("0.1234567", { dp: 3 }); // "12.345%"

// Handling invalid values with fallback
formatNumber(undefined); // ""
formatNumber(undefined, { fallback: "N/A" }); // "N/A"
formatAmount("", { fallback: "0" }); // "0"
formatPercent(NaN, { fallback: "Invalid" }); // "Invalid"
```

### Base Unit Conversion

```typescript
import { toBaseUnit, fromBaseUnit } from "@initia/utils";

// Convert base units to display amount
fromBaseUnit("1500000", { decimals: 6 }); // "1.500000"
fromBaseUnit("1", { decimals: 6 }); // "0.000001"
fromBaseUnit("1234567890", { decimals: 6 }); // "1234.567890"

// Convert display amount to base units
toBaseUnit("1.5", { decimals: 6 }); // "1500000"
toBaseUnit("0.000001", { decimals: 6 }); // "1"
toBaseUnit("1234.56789", { decimals: 6 }); // "1234567890"

// Note: toBaseUnit rounds down fractional amounts
toBaseUnit("1.9999999", { decimals: 6 }); // "1999999"
```

### Address Utilities

```typescript
import { InitiaAddress } from "@initia/utils";

// Convert between address formats
const address1 = InitiaAddress("init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs");
address1.hex; // "0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1"
address1.rawHex; // "77d96ae5e7885b19b5bf4e680e129ace8fd58fb1"

const address2 = InitiaAddress("0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1");
address2.bech32; // "init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs"
address2.rawHex; // "77d96ae5e7885b19b5bf4e680e129ace8fd58fb1"

// Validate addresses
InitiaAddress.validate("init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs"); // true
InitiaAddress.validate("0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1"); // true
InitiaAddress.validate("invalid-address"); // false

// Compare addresses (handles different formats)
InitiaAddress.equals(
  "init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs",
  "0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1",
); // true

// Convert to bytes
const address = InitiaAddress("0x1");
address.bytes; // Uint8Array(20)
const address32 = InitiaAddress("0x1", 32);
address32.bytes; // Uint8Array(32)

// Special handling for address 0x1
const specialAddress = InitiaAddress("0x1");
specialAddress.hex; // "0x1"
specialAddress.bech32; // "init1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqr5e3d"

// Empty or invalid addresses throw errors
try {
  InitiaAddress(""); // throws "address is required"
} catch (e) {
  console.error(e.message);
}

try {
  InitiaAddress("invalid-address"); // throws "invalid address"
} catch (e) {
  console.error(e.message);
}

// Destructuring support
const { bech32, hex, rawHex } = InitiaAddress("0x1");
console.log(bech32); // "init1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqr5e3d"
console.log(hex); // "0x1"
console.log(rawHex); // "0000000000000000000000000000000000000001"
```

### BCS (Binary Canonical Serialization)

```typescript
import { bcs, resolveBcsType } from "@initia/utils";

// Serialize addresses
const serialized = bcs.address().serialize("0x1").toBase64();
// "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE="

// Serialize various types
bcs.u64().serialize(123);
bcs.string().serialize("Hello, world!");
bcs.vector(bcs.u8()).serialize([1, 2, 3]);

// Special Move types
bcs.fixedPoint32().serialize(1.5); // Fixed-point with 2^32 scaling
bcs.fixedPoint64().serialize(1.5); // Fixed-point with 2^64 scaling
bcs.decimal128().serialize(1.5); // Decimal with 10^18 scaling
bcs.bigdecimal().serialize("123.456"); // Arbitrary precision decimal

// Resolve Move-style type strings dynamically
const addressType = resolveBcsType("0x1::string::String"); // returns bcs.string()
const optionType = resolveBcsType("0x1::option::Option<u64>"); // returns bcs.option(bcs.u64())
```

### Object Utilities

```typescript
import {
  createObjectAddress,
  createUserDerivedObjectAddress,
  denomToMetadata,
  getIbcDenom,
} from "@initia/utils";

// Create deterministic object addresses
const objectAddress = createObjectAddress("0x1", "uinit");
// "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9"

// Create user-derived object addresses
const derivedAddress = createUserDerivedObjectAddress(
  "0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1",
  "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
);
// "0x350045f8766ac3ff7e58ee316786cf1646765f435824345bc9f79d9626c11396"

// Get metadata address for denoms
denomToMetadata("uinit"); // "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9"
denomToMetadata("move/0x123...abc"); // "0x123...abc"

// Get IBC denom hash
getIbcDenom(
  "channel-0",
  "l2/771d639f30fbe45e3fbca954ffbe2fcc26f915f5513c67a4a2d0bc1d635bdefd",
);
// "ibc/82EB1C694C571F954E68BFD68CFCFCD6123B0EBB69AAA8BAB7A082939B45E802"
```

## API Reference

### truncate(str?, lengths?)

Truncates a string, keeping the beginning and end.

- `str`: `string` - The string to truncate (default: "")
- `lengths`: `[number, number]` - Characters to keep at [start, end] (default: [6, 6])

### formatNumber(value, options?)

Formats a number with thousands separators and decimal places.

- `value`: `number | string | bigint | BigNumber` - The value to format
- `options.dp`: `number` - Decimal places (default: 2)
- `options.abbr`: `boolean` - Use abbreviations (K, M, B, T) (default: false)
- `options.fallback`: `string` - Value to return for invalid inputs (default: "")

### formatAmount(value, options?)

Formats a blockchain amount, converting from base units to display units.

- `value`: `number | string | bigint | BigNumber` - The value in base units
- `options.decimals`: `number` - Token decimals (default: 0)
- `options.dp`: `number` - Decimal places (default: min(decimals, 6))
- `options.abbr`: `boolean` - Use abbreviations (default: false)
- `options.fallback`: `string` - Value to return for invalid inputs (default: "")

### toBaseUnit(value, options?)

Converts a display amount to base units.

- `value`: `number | string | bigint | BigNumber` - The display amount
- `options.decimals`: `number` - Token decimals (default: 0)
- `options.fallback`: `string` - Value to return for invalid inputs (default: "")

### fromBaseUnit(value, options?)

Converts base units to a display amount.

- `value`: `number | string | bigint | BigNumber` - The amount in base units
- `options.decimals`: `number` - Token decimals (default: 0)
- `options.fallback`: `string` - Value to return for invalid inputs (default: "")

### formatPercent(value, options?)

Formats a decimal as a percentage.

- `value`: `number | string | bigint | BigNumber` - The decimal value (0.1 = 10%)
- `options.dp`: `number` - Decimal places (default: 2 for <100%, 0 for ≥100%)
- `options.fallback`: `string` - Value to return for invalid inputs (default: "")

### Address Utilities

#### InitiaAddress(address, byteLength?)

Creates an InitiaAddress instance. Can be called with or without the `new` keyword.

- `address`: `string` - The address (hex or bech32) to convert (required)
- `byteLength`: `number` - Target byte length for the bytes property (default: 20)
- Throws: `Error` - "address is required" for empty addresses, "invalid address" for invalid addresses

##### Instance Properties

- `bech32`: `string` - The address in bech32 format
- `hex`: `string` - The address in checksummed hex format
- `rawHex`: `string` - The address in raw hex format (lowercase, no prefix)
- `bytes`: `Uint8Array` - The address as bytes (length determined by constructor parameter)

##### Static Methods

#### InitiaAddress.validate(address)

Validates an address.

- `address`: `string` - The address to validate
- Returns: `boolean` - false if address is empty or invalid, true if valid

#### InitiaAddress.equals(address1, address2)

Compares two addresses regardless of format.

- `address1`: `string` - First address
- `address2`: `string` - Second address
- Returns: `boolean` - true if addresses are equal, handles empty/invalid addresses gracefully

### BCS Serialization

#### bcs

Extended BCS serializer that includes all standard types from `@mysten/bcs` plus:

- `bcs.address()` - 32-byte address serializer
- `bcs.object()` - Alias for address serializer
- `bcs.fixedPoint32()` - Fixed-point number with 2^32 scaling
- `bcs.fixedPoint64()` - Fixed-point number with 2^64 scaling
- `bcs.decimal128()` - 128-bit decimal with 10^18 scaling
- `bcs.decimal256()` - 256-bit decimal with 10^18 scaling
- `bcs.bigdecimal()` - Arbitrary precision decimal

#### resolveBcsType(typeStr)

Resolves Move-style type strings to BCS types.

- `typeStr`: `string` - Move type string (e.g., "0x1::string::String")
- Returns: `BcsType` - Corresponding BCS type

### Object Utilities

#### createObjectAddress(source, seed)

Creates a deterministic object address.

- `source`: `string` - Source address
- `seed`: `string` - Seed string
- Returns: `string` - Object address (hex)

#### createUserDerivedObjectAddress(source, derivedFrom)

Creates a user-derived object address.

- `source`: `string` - Source address
- `derivedFrom`: `string` - Address to derive from
- Returns: `string` - Derived object address (hex)

#### denomToMetadata(denom)

Gets the metadata address for a denomination.

- `denom`: `string` - The denomination
- Returns: `string` - Metadata address

#### getIbcDenom(channelId, denom)

Calculates the IBC denom hash.

- `channelId`: `string` - IBC channel ID
- `denom`: `string` - Original denomination
- Returns: `string` - IBC denom (e.g., "ibc/HASH...")

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the library
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## License

MIT
