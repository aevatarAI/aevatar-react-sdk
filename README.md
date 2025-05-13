# aevatar-react-sdk

> React SDK for aevatar.ai — Monorepo for on-chain autonomous intelligence UI & logic

---

## Project Overview

This repository is a monorepo containing the official React SDK and UI components for [aevatar.ai](https://aevatar.ai/). It provides core logic, UI, service APIs, type definitions, and utilities for building on-chain autonomous intelligence applications.

---

## Monorepo Structure

```
/packages
  core/      # Core SDK logic
  ui-react/  # React UI components
  services/  # Service/API wrappers
  types/     # Type definitions
  utils/     # Utilities
  demo/      # Example/demo app
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8

### Install dependencies
```bash
pnpm install
```

### Build all packages
```bash
pnpm build
```

### Run tests
```bash
pnpm test
```

### Lint & Format
```bash
pnpm lint
pnpm format
```

---

## Packages Overview

- **core**: Core SDK logic, aggregates services and utilities.
- **ui-react**: React UI components, depends on core.
- **services**: API/service wrappers for aevatar.
- **types**: Shared type definitions.
- **utils**: Common utilities.
- **demo**: Example app for development and showcase.

---

## Development Workflow

- Use `pnpm` for all workspace management.
- Use `vite` for building and serving packages.
- Use `vitest` for testing.
- Use `biome` for linting and formatting.
- Use `changesets` for versioning and publishing.

### Start demo app
```bash
cd packages/demo
pnpm install
pnpm dev
```

---

## Publishing & Versioning

- Use [changesets](https://github.com/changesets/changesets) for managing versions and changelogs.
- To publish:
```bash
pnpm publish:changeset   # Create a changeset
pnpm publish:change-version  # Bump versions
pnpm publish             # Build and publish all packages
```

---

## Contributing

- Pre-commit hooks enforce lint and test (see `.lefthook.yml`).
- Please run lint and tests before submitting PRs.
- All code should be covered by tests and follow the project style guide (biome).

---

## License

ISC © aevatar.ai 