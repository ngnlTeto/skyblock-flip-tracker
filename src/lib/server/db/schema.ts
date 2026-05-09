import { eq, defineRelations } from 'drizzle-orm';
import {
	pgTable,
	serial,
	integer,
	text,
	doublePrecision,
	varchar,
	timestamp,
	boolean,
	pgView,
	primaryKey,
	unique
} from 'drizzle-orm/pg-core';

export const pricesTable = pgTable('prices', {
	itemId: varchar('item_id', { length: 256 }).primaryKey(),
	itemName: varchar('item_name', { length: 256 }).notNull(),
	buyPrice: doublePrecision('buy_price').notNull(),
	sellPrice: doublePrecision('sell_price').notNull()
});

// Table to track craft flip opportunities
export const flipsTable = pgTable(
	'flips',
	{
		id: serial('id').primaryKey(),
		outputItemId: serial('output_item_id').notNull(),
		inputItemsId: serial('input_items_id').notNull(),
		// meta information
		category: varchar('category', { length: 50 }),
		isActive: boolean('is_active').default(true),
		notes: text('notes'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow()
	},
	(t) => [unique().on(t.inputItemsId), unique().on(t.outputItemId)]
);

export const itemComponentsTable = pgTable('item_component', {
	id: serial('id').primaryKey(),
	itemId: varchar('item_id', { length: 256 }).notNull(),
	quantity: integer('output_quantity').default(1)
});

export const inputItemsTable = pgTable(
	'input_items',
	{
		id: serial('id')
			.primaryKey()
			.references(() => flipsTable.inputItemsId),
		componentId: serial('component_id')
			.notNull()
			.references(() => itemComponentsTable.id)
	},
	(t) => [primaryKey({ columns: [t.id, t.componentId] })]
);

export const relations = defineRelations({ flips: flipsTable, inputItems: inputItemsTable, itemComponents: itemComponentsTable }, (r) => ({
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

export const itemPriceComponentsView = pgView('item_price_component').as((dq) =>
	dq
		.select({
			id: itemComponentsTable.id,
			itemId: itemComponentsTable.itemId,
			itemName: pricesTable.itemName,
			buyPrice: pricesTable.buyPrice,
			sellPrice: pricesTable.sellPrice,
			quantity: itemComponentsTable.quantity
		})
		.from(itemComponentsTable)
		.leftJoin(pricesTable, eq(itemComponentsTable.itemId, pricesTable.itemId))
);
