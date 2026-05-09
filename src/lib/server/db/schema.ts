import { eq, defineRelations } from 'drizzle-orm';
import { pgTable, serial, integer, text, doublePrecision, varchar, timestamp, boolean, pgView, primaryKey } from 'drizzle-orm/pg-core';

export const prices = pgTable('prices', {
	itemId: varchar('item_id', { length: 256 }).primaryKey(),
	itemName: varchar('item_name', { length: 256 }),
	buyPrice: doublePrecision('buy_price'),
	sellPrice: doublePrecision('sell_price')
});

// Table to track craft flip opportunities
export const flips = pgTable('flips', {
	id: serial('id').primaryKey(),
	outputItemId: serial('output_item_id').notNull(),
	inputItemsId: serial('input_items_id').notNull(),
	// meta information
	category: varchar('category', { length: 50 }),
	isActive: boolean('is_active').default(true),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const itemComponents = pgTable('item_component', {
	id: serial('id').primaryKey(),
	itemId: varchar('item_id', { length: 256 }).notNull(),
	quantity: integer('output_quantity').default(1)
});

export const inputItems = pgTable(
	'input_items',
	{
		id: serial('id')
			.primaryKey()
			.references(() => flips.inputItemsId),
		componentId: serial('component_id')
			.notNull()
			.references(() => itemComponents.id)
	},
	(t) => [primaryKey({ columns: [t.id, t.componentId] })]
);

export const relations = defineRelations({ flips, inputItems, itemComponents }, (r) => ({
	flips: {
		outputItem: r.one.itemComponents({
			from: r.flips.outputItemId,
			to: r.itemComponents.id,
			optional: false,
			alias: 'output_item'
		}),
		inputItems: r.many.itemComponents({
			from: r.flips.inputItemsId.through(r.inputItems.id),
			to: r.itemComponents.id.through(r.inputItems.componentId)
		})
	}
}));

export const itemPriceComponents = pgView('item_price_component').as((dq) =>
	dq
		.select({
			id: itemComponents.id,
			itemId: itemComponents.itemId,
			itemName: prices.itemName,
			buyPrice: prices.buyPrice,
			sellPrice: prices.sellPrice,
			quantity: itemComponents.quantity
		})
		.from(itemComponents)
		.leftJoin(prices, eq(itemComponents.itemId, prices.itemId))
);
