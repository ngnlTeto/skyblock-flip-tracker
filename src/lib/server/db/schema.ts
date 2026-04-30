import { pgTable, serial, integer, text, doublePrecision, varchar, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const prices = pgTable('prices', {
	itemId: varchar('item_id', { length: 256 }).primaryKey(),
	buyPrice: doublePrecision('buy_price'),
	sellPrice: doublePrecision('sell_price'),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Table to track craft flip opportunities
export const flips = pgTable('flips', {
	id: serial('id').primaryKey(),
	// Output item (the crafted result)
	outputItemId: varchar('output_item_id', { length: 256 }).notNull(),
	outputItemName: varchar('output_item_name', { length: 256 }),
	// Input items (ingredients) - stored as JSON array
	// Each item: { itemId: string, itemName: string, quantity: number }
	inputItems: jsonb('input_items').notNull().default([]),
	// Quantity of output items produced
	outputQuantity: integer('output_quantity').default(1),
	isActive: boolean('is_active').default(true),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});
