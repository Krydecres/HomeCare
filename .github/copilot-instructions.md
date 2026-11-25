Read and strictly follow /AGENTS.md (Vietnamese) before suggesting or generating any code.

Summary:
- Source of truth: Google Sheet "BacklogSOA" (mirror: docs/backlog/*.csv). Sheet `01_AI_RULES` wins over any suggestion.
- Architecture: SOA microservices with Spring Boot + Spring MVC layers (controller -> service -> repository) exactly as listed in `09_Service_Catalog`. No hexagonal/clean architecture, CQRS, event sourcing, WebFlux or GraphQL. No cross-schema DB access.
- Only use names registered in `11_Naming_Registry` (Approved/Implemented/Renamed; old names and Deprecated names are blocked by CI). When renaming anything, update the registry (old name column), API contract, data dictionary, backlog and change log in the same PR.
- Do not code a screen/API before its wireframe is "Đã duyệt". Do not invent business rules; add an open question instead.
- Frontend: one React web app in `frontend/` (Vite + React 19 + TypeScript strict, TanStack Query, Zustand, React Hook Form + Zod, React Router, Tailwind + Radix, own `Hc*` components in `src/shared/ui`). No mobile app, no Redux, no Next.js/SSR, no other UI kit, no CSS-in-JS. Never store tokens in the browser: the api-gateway is the BFF (HttpOnly session cookie + CSRF). Pages must be responsive (works at 390px).
