# Skyblock Flip Tracker - AI Agent Instructions

## Build and development

- Start development: `pnpm dev`
- Build for production: `pnpm build`
- Type check: `pnpm check`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Database: `pnpm db:generate`, `pnpm db:push`, `pnpm db:migrate`, `pnpm db:studio`

## Architecture overview

- SvelteKit 3.x application with Svelte 5 runes mode
- Vite 8 + Node adapter for deployment
- PostgreSQL database with Drizzle ORM and schema-first migrations
- Tailwind CSS v4 + shadcn-svelte UI components
- Custom Skyblock/Hypixel API client under `src/lib/server/skyblock-api/`
- Server routes and page loaders live under `src/routes/` using SvelteKit conventions (`+page.server.ts`, `+server.ts`, etc.)

## Code conventions

- File naming: kebab-case for files, PascalCase for components
- Import alias: `#lib/` for `src/lib` (via `imports` in package.json)
- Database schema: `src/lib/server/db/schema.ts`; migrations in `drizzle/`
- UI state: prefer Svelte 5 runes (`$state`, `$derived`, `$props`)
- Keep route logic in `src/routes`, server utilities in `src/lib/server`, and UI in `src/lib/components`
- When changing SvelteKit behavior, follow SvelteKit 3 conventions rather than SvelteKit 2-era patterns

## Common pitfalls

- Run `pnpm check` after Svelte or route changes; it runs `svelte-kit sync` and validates TS/Svelte types
- Do not introduce stale SvelteKit 2 patterns or deprecated APIs after the upgrade
- Keep adapter and `@sveltejs/kit` versions aligned with the project upgrade
- Set `DATABASE_URL` before database operations or local development
- Watch for TypeScript issues around event types, form actions, and route data loading
- Monitor Skyblock API rate limits and ensure DB writes remain transaction-safe

## Key files

- `src/routes/+page.svelte`: main flip dashboard
- `src/routes/+page.server.ts`: server-side data loading and profit calculations
- `src/routes/api/`: API endpoints for flip data and related services
- `src/lib/server/db/schema.ts`: database schema
- `src/lib/server/skyblock-api/`: Skyblock data clients
- `drizzle.config.ts`: Drizzle database configuration
- `README.md`: project overview and setup guidance

## Links

- [README.md](README.md) - Project overview
- [src/routes/+page.svelte](src/routes/+page.svelte) - Main dashboard UI
- [src/lib/server/db/schema.ts](src/lib/server/db/schema.ts) - Database schema
