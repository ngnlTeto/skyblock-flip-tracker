# Skyblock Flip Tracker - AI Agent Instructions

## Build and Development
- **Start development**: `pnpm dev`
- **Build for production**: `pnpm build`
- **Type check**: `pnpm check`
- **Lint and format**: `pnpm lint` and `pnpm format`
- **Database operations**: Use `pnpm db:generate`, `pnpm db:push`, `pnpm db:migrate`, `pnpm db:studio`

## Architecture Overview
- SvelteKit 2.x application with Svelte 5 (runes mode)
- PostgreSQL database with Drizzle ORM (schema-first)
- Tailwind CSS v4 + shadcn-svelte UI components
- Node.js adapter for deployment
- Custom Skyblock API client for Hypixel data

## Code Conventions
- File naming: kebab-case for files, PascalCase for components
- Import alias: `$lib/` for src/lib
- Database: Migrations in `drizzle/` directory
- UI: shadcn-svelte components with Tailwind classes

## Common Pitfalls
- Fix TypeScript errors (e.g., EventTarget typing issues)
- Run `pnpm format` to fix Prettier issues
- Set `DATABASE_URL` environment variable
- Monitor Skyblock API rate limits
- Experimental features (remote functions) may change

## Key Files
- `src/routes/+page.svelte`: Main flip dashboard
- `src/routes/+page.server.ts`: Server data loading with profit calculations
- `src/lib/server/db/schema.ts`: Database schema
- `src/lib/server/skyblock-api/`: API client for Skyblock data
- `drizzle.config.ts`: Database configuration

## Links
- [README.md](README.md) - Project overview</content>
<parameter name="filePath">c:\Users\henry\source\repos\skyblock-flip-tracker\AGENTS.md
