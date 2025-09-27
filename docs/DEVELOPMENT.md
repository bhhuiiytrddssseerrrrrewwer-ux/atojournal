# Development Guide

## Setup
1. Node.js 16+
2. Install deps: `npm install`
3. Start dev server: `npm run dev` → http://localhost:5173

## Scripts
- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build
- `npm run lint` — ESLint
- `npm run test` — Vitest in watch mode
- `npm run test:ui` — Vitest UI
- `npm run test:run` — Vitest CI mode

## Testing
- Test env: `vitest`, DOM via `jsdom`
- Unit tests live under `src/__tests__/`
- Add setup hooks in `src/test/setup.ts` as needed

## Code Style
- TypeScript, explicit types for public interfaces and context APIs
- Prefer early returns and small components
- Avoid deep nesting; handle edge cases first
- Keep components presentational; use context/hooks for stateful logic

## UI/UX
- Tailwind for utility-first styling
- Keep forms accessible; label inputs and use semantic HTML

## State
- Use `TradeContext` for cross-cutting data and derived stats
- Avoid prop drilling; prefer context selectors or memoization when necessary

## Conventions
- `src/types` for shared types
- `src/utils` for pure utilities (parsers, formatters)
- `src/components` for UI building blocks


