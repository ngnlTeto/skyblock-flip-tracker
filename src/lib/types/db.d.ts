import type { pricesTable } from "$lib/server/db/schema";

export type ItemPrice = typeof pricesTable.$inferSelect;
