# Architecture

LIV DOT uses feature-first Clean Architecture. Event code is organized by capability, then separated into domain, application, infrastructure, and presentation layers.

```text
Presentation → Application → Domain
Infrastructure → Application contracts + Domain types
Composition root → chooses infrastructure adapter and provides it to the app
```

## Domain

`src/features/events/domain` defines immutable event types and pure readiness/transition policies. It does not import React, Next.js, application, infrastructure, or presentation code. Readiness is an evaluation; it does not mutate event status. The only primary status edges are DRAFT → SCHEDULED → READY → LIVE → COMPLETED → REPLAY_AVAILABLE.

## Application

`application/ports/event.repository.ts` is the persistence boundary. Use cases retrieve, list, or transition events through that interface. Transition use case checks current state and optional expected version before requesting a mutation. React Query hooks live in the application-facing React boundary and consume a repository provided through context.

## Infrastructure

The HTTP repository validates unknown JSON with Zod and maps DTOs into the domain model. MSW handles the same versioned REST contract. Mock transition handlers independently re-evaluate policies and version checks so tests do not rely only on client-side validation.

## Presentation and composition

App Router pages compose feature views. Feature UI consumes application hooks and does not implement domain rules or API calls. `src/shared/providers/providers.tsx` constructs the HTTP adapter, provides it to application hooks, initializes browser MSW when enabled, and mounts TanStack Query, theme, and toast providers. It gates child mounting until MSW has initialized to prevent query requests racing the worker. Server components do not issue API requests.

## State ownership

TanStack Query owns server data and request state. Domain entities contain only business facts; loading, retry, and visual status mappings stay in presentation/application layers. Local view state will use React state when later screens need it.
