import { pgTable, doublePrecision, varchar } from 'drizzle-orm/pg-core';

export const pricesTable = pgTable('prices', {
	itemId: varchar('item_id', { length: 256 }).primaryKey(),
	itemName: varchar('item_name', { length: 256 }).notNull(),
	buyPrice: doublePrecision('buy_price'),
	sellPrice: doublePrecision('sell_price')
});
