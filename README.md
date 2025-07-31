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

#### AddressUtils.toBytes(address, byteLength?)

Converts an address to bytes.

- `address`: `string` - The address to convert (required)
- `byteLength`: `number` - Target byte length (default: 20)

#### AddressUtils.toBech32(address, prefix?)

Converts an address to bech32 format.

- `address`: `string` - The address to convert (required)
- `prefix`: `string` - Bech32 prefix (default: "init")

#### AddressUtils.toHex(address)

Converts an address to checksummed hex format.

- `address`: `string` - The address to convert (required)

#### AddressUtils.validate(address, prefix?)

Validates an address.

- `address`: `string` - The address to validate (required)
- `prefix`: `string` - Expected bech32 prefix (default: "init")
- Returns: `boolean` - false if address is empty, true if valid

#### AddressUtils.equals(address1, address2)

Compares two addresses regardless of format.

- `address1`: `string` - First address (required)
- `address2`: `string` - Second address (required)
- Returns: `boolean` - true if addresses are equal

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

#### getMetadata(denom)

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
