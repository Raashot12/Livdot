# Event domain model

`EventEntity` contains identity, content, lifecycle status, operational readiness, schedule timestamp, and optimistic concurrency version. It excludes presentation state such as loading, active tab, colors, or modal visibility.

`evaluateReadiness` returns all missing operational requirements. `evaluateTransition` accepts only the primary lifecycle edge and checks all readiness requirements for SCHEDULED → READY. Passing readiness checks does not automatically transition an event. The API/mock owns the authoritative update and increments the version after a successful state change.
