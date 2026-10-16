# Architecture decisions

## Next.js App Router

The requested platform needs clear routing and server/client boundaries. The router provides the planned nested route structure; Phase 1 keeps data reads client-side so the MSW browser worker is available before requests begin.

## Feature-first Clean Architecture

Grouping by events keeps related policies, use cases, adapters, and screens together. Explicit layer boundaries make backend replacement and focused testing practical.

## Pure domain policies

Readiness and lifecycle behavior are plain TypeScript functions. This keeps business invariants independent of UI, browser, transport, and workflow libraries.

## TanStack Query

Event reads and transitions are asynchronous server state. Query keys and hooks centralize request lifecycle and cache invalidation without putting presentation state into domain entities.

## MSW

MSW intercepts HTTP requests at the network boundary, so development and integration tests exercise the same repository adapter. Mutable fixtures model state changes, errors, latency, and optimistic concurrency without introducing a fake server framework.

## TypeScript and Zod

Strict TypeScript checks internal contracts. Zod validates unknown API responses at runtime before mapping them into trusted domain values.

## shadcn/ui and Radix

shadcn/ui provides copy-owned accessible primitives built on Radix. Tailwind v4 and CSS-variable tokens support the visual system while keeping component source adaptable.

## Why no real backend

The assessment explicitly scopes this phase to frontend foundation and permits mocked APIs. A NestJS service, database, cache, identity, or payment infrastructure would add deployment and integration concerns without improving the frontend architecture evidence this phase is meant to establish.
