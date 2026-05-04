# Copilot instructions for skyblock-flip-tracker

Purpose
- Give Copilot sessions quick, precise entry points for common tasks in this repo.

Build, test, and lint commands
- Install deps: pnpm install
- Dev server: pnpm dev
- Build: pnpm build
- Preview production build: pnpm preview
- Typecheck: pnpm check (uses svelte-check)
- Lint: pnpm lint
- Format: pnpm format
- Database (Drizzle): pnpm db:generate | pnpm db:push | pnpm db:migrate | pnpm db:studio
- Tests: No test runner or "test" script configured. If tests are added, run them via the test runner's CLI (e.g., pnpm test -- <pattern>)

High-level architecture
- SvelteKit 2.x app (Svelte 5, runes mode). UI in src/routes and src/lib/components; main dashboard: src/routes/+page.svelte.
- Server endpoints and API routes live under src/routes/api (e.g., /api/flips).
- Database: PostgreSQL managed via Drizzle ORM. Schema defined in src/lib/server/db/schema.ts; migrations live in drizzle/.
- Skyblock data: custom client in src/lib/server/skyblock-api/ (bazaar, auctions, index).
- UI: Tailwind v4 + shadcn-svelte components; custom UI primitives in src/lib/components/ui.
- Adapter: @sveltejs/adapter-node; Vite config in vite.config.ts.

Key conventions
- File naming: kebab-case for files; Svelte components use PascalCase.
- Import alias: use $lib/ to reference src/lib.
- DB JSONB fields include TypeScript $type annotations in schema.ts (e.g., inputItems, extraCoins).
- Server code uses SvelteKit route handlers (+server.ts, +page.server.ts). API handlers return json(...) from @sveltejs/kit.
- UI state uses Svelte 5 runes primitives ($state, $derived, $props) — review +page.svelte for examples.
- Migrations: add a new SQL file under drizzle/ (incremental numbering) for schema changes and run pnpm db:migrate.
- Env: set DATABASE_URL for DB commands and development (see .env.example).

Where to start for common tasks
- Add DB column: update src/lib/server/db/schema.ts, add migration in drizzle/, then run pnpm db:migrate.
- Update flips API: src/routes/api/flips/+server.ts (create/PUT/GET logic).
- Change UI: edit src/routes/+page.svelte and matching components in src/lib/components.

Existing AI assistant configs to reference
- AGENTS.md: contains agent instructions and useful project notes; consult when automating tasks.

Maintainers: review README.md and AGENTS.md for additional context.
