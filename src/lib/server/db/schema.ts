import { pgTable, serial, integer, text, doublePrecision, varchar } from 'drizzle-orm/pg-core';

export const prices = pgTable('prices', {
	itemId: varchar('item_id', { length: 256 }).primaryKey(),
	buyPrice: doublePrecision('buy_price'),
	sellPrice: doublePrecision('sell_price')
});
