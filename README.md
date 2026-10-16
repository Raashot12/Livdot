# LIV DOT

LIV DOT is a live-event hosting, ticketing, and broadcast operations platform. This frontend demo uses Next.js App Router, TanStack Query, and an MSW-backed local API so the event workflow can be exercised without a NestJS service.

## Implemented

- Next.js App Router, React, strict TypeScript, Tailwind CSS v4, and shadcn/ui configuration.
- Feature-first Clean Architecture with a pure event domain core.
- Event readiness evaluation and primary lifecycle transition policies.
- Repository port, use cases, HTTP adapter, and runtime response validation.
- MSW-backed API with browser-persisted event state, latency, explicit failure scenarios, and version checks.
- Six-step event creation with an optional section-based seat map builder and preview.
- Host dashboard, event detail, readiness, crew and streaming, live control, replay, ticketing, and order management screens.
- Public event discovery, event details, configured seat selection, a multi-event basket, and combined checkout.
- Local preview sign-in and account creation for host and guest roles.
- Simulated Paystack-style checkout and local ticket confirmation; no real payment is processed.
- Presentation components, page hooks, utilities, and constants separated from the core view files.
- Theme tokens, Inter typography, and light/dark theme infrastructure.
- Vitest, React Testing Library, MSW Node setup, and Playwright configuration for future end-to-end flows.

## Technology decisions

- **Next.js App Router** supplies route organization and server/client component boundaries; data queries start only in client UI so browser MSW can intercept them.
- **Feature-first Clean Architecture** keeps event behavior cohesive while adapters and UI can change independently.
- **Pure domain policies** keep readiness and lifecycle rules deterministic and testable without framework dependencies.
- **TanStack Query** owns asynchronous query and mutation state at the React boundary.
- **MSW** exercises the same HTTP adapter in development and integration tests, with no backend required.
- **TypeScript strict mode and Zod** provide compile-time contracts and runtime DTO validation.
- **shadcn/ui and Radix primitives** provide accessible component foundations that remain owned by this codebase.

## Requirements

- Node.js 22 LTS (or newer supported LTS).
- pnpm 12 (the package manager is pinned in `package.json`).

## Setup

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm exec msw init public --save
pnpm dev
```

In development, the local API mock worker starts by default, so the dashboard works without a NestJS service. Set `NEXT_PUBLIC_ENABLE_MOCKS=false` to opt out and use `NEXT_PUBLIC_API_BASE_URL` for a compatible API. Set `NEXT_PUBLIC_MOCK_API_LATENCY_MS` to tune simulated latency and `NEXT_PUBLIC_MOCK_FAILURE_SCENARIO` to `transition` or `all` to exercise service failures. In production, set `NEXT_PUBLIC_ENABLE_MOCKS=true` to run the local demo API.

## Public ticket buyer flow

- Hosts can enable a seat map when the event has a venue capacity, then define sections with rows, seats per row, and prices. Events without a configured map keep the standard ticket selection flow.
- Buyers can add tickets from multiple events to the basket and continue through one combined checkout.
- Checkout and confirmation are local previews. The Paystack-style payment step does not contact Paystack, move money, or create a real booking. Do not enter real payment details.
- Host and guest accounts are local browser previews. Authentication is not connected to a production identity provider.

The TypeScript `@/*` alias points to `src/*` through `paths` in `tsconfig.json`. Paths resolve relative to that file, so `baseUrl` is not required. Next.js generated route types are included for editor and command-line type checking.

## Commands

| Command                             | Purpose                                    |
| ----------------------------------- | ------------------------------------------ |
| `pnpm dev`                          | Start development server                   |
| `pnpm build` / `pnpm start`         | Build and serve production app             |
| `pnpm lint`                         | Run ESLint and architecture boundary rules |
| `pnpm typecheck`                    | Run strict TypeScript checking             |
| `pnpm test` / `pnpm test:watch`     | Run Vitest suite / watch mode              |
| `pnpm test:coverage`                | Run tests with V8 coverage                 |
| `pnpm format` / `pnpm format:check` | Format source / check formatting           |
| `pnpm test:e2e`                     | Run the prepared Playwright suite          |

## Structure

```text
src/app/                 App Router pages, layouts, providers, tokens
src/features/events/     Domain, application, infrastructure, presentation
src/shared/               Shared UI foundations and provider wiring
src/mocks/                MSW handlers, deterministic fixtures, mock store
src/test/                 Shared test setup
docs/                     Architecture and assessment notes
```

The domain layer has no React, Next.js, networking, or state library dependencies. Application use cases depend on the `EventRepository` port. Infrastructure implements that port. `src/shared/providers/providers.tsx` is the composition boundary that supplies the repository to application hooks and starts browser mocking before rendering query consumers.

Presentation views compose imported components and hooks. Static UI configuration belongs in constants, and pure formatting or mapping helpers live in presentation utilities.

## Mock API

| Method | Path                                  | Behavior                                                                     |
| ------ | ------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/api/v1/events`                      | Returns current fixture and created event state                              |
| GET    | `/api/v1/events/:eventId`             | Returns one event or 404                                                     |
| POST   | `/api/v1/events`                      | Validates and creates a draft or scheduled event                             |
| PATCH  | `/api/v1/events/:eventId/readiness`   | Saves crew and streaming readiness changes                                   |
| POST   | `/api/v1/events/:eventId/transitions` | Validates lifecycle, readiness, and `expectedVersion`; returns updated event |

The browser mock store persists event creation, readiness changes, and lifecycle changes in local storage under `liv-dot-events-mock-v1`. Readiness and lifecycle mutations increment `version`; transitions also return 409 for stale writes. Set `NEXT_PUBLIC_MOCK_FAILURE_SCENARIO=transition` or `all` to simulate 503 responses. Artificial latency is configured by `NEXT_PUBLIC_MOCK_API_LATENCY_MS`.

Fixtures cover scheduled events with missing ingest, scheduled and ready, live, and completed states. Readiness being satisfied does not itself change lifecycle status.

## Testing

Domain policy tests cover each readiness blocker, combined blockers, successful readiness, allowed/invalid transitions, and the completed-to-live rejection. Application tests cover retrieval, mutation, validation before mutation, network errors, and version conflicts. An infrastructure integration test uses the MSW Node server and actual HTTP repository adapter. Playwright is configured for later screen level flows; no full UI E2E suite is included yet.

## Limitations and future phases

- No NestJS service, production authentication provider, real payment provider, external streaming ingest, or broadcast playback integration is included.
- Seat selection is available only for events with a configured seat map. Maps are generated from sections rather than a freeform venue editor.
- Event, preview account, basket, and simulated order data are browser-local and are not shared between devices.
- Browser mock data persists between reloads; clear the `liv-dot-events-mock-v1` local-storage entry to restore the seed fixtures.
- Failure scenario configuration is currently exposed through the mock store for deterministic local/test control.

The local API is a replaceable frontend adapter. A compatible backend can be connected later through `NEXT_PUBLIC_API_BASE_URL` without changing the presentation or domain policies.
