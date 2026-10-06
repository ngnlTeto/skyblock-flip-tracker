import type { pricesTable } from '#lib/server/db/schema.js';

export type ItemPrice = typeof pricesTable.$inferSelect;
