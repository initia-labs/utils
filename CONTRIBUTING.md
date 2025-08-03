# Contributing to @initia/utils

## Quick Start

**Prerequisites**: Node.js 22+, pnpm

```bash
git clone https://github.com/initia-labs/utils.git
cd utils
pnpm install
```

## Development Commands

```bash
# Testing
pnpm test                     # Run all tests
pnpm test src/format.test.ts  # Run specific test
pnpm vitest                   # Watch mode

# Code Quality
pnpm typecheck                # TypeScript check
pnpm lint                     # ESLint
pnpm build                    # Build library
```

## Coding Standards

### Core Principles

1. **Precision First**: Use BigNumber.js for all numeric operations
2. **Type Safety**: Strong TypeScript types
3. **Predictable Behavior**: Handle edge cases (`null`, `undefined`, `NaN`, `Infinity`)
4. **Modularity**: Focused, single-purpose utilities

### Module Structure

- `format`: Number/amount formatting with BigNumber.js
- `text`: String manipulation
- `address`: Blockchain address handling (bech32/hex)
- `bcs`: Binary Canonical Serialization for Move types
- `object`: Object manipulation

Each module has corresponding tests and exports through `src/index.ts`.

### Testing Requirements

- Comprehensive test coverage for new functionality
- Test edge cases and error conditions
- Deterministic tests with descriptive names

## Submission Process

1. **Branch**: `git checkout -b feat/feature-name` or `fix/bug-name`

2. **Develop**: Follow coding standards, add tests, update docs

3. **Commit**: Use conventional format
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation
   - `test:` Tests
   - `refactor:` Code refactoring
   - `chore:` Maintenance

4. **Validate**: Run all checks before submitting

   ```bash
   pnpm typecheck && pnpm lint && pnpm test && pnpm build
   ```

5. **Pull Request**: Create PR against `main` with clear description
