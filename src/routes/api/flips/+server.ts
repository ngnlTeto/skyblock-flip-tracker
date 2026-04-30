import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { flips, prices } from '$lib/server/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

// Helper to get prices for multiple items
async function getPricesForItems(itemIds: string[]) {
	if (itemIds.length === 0) return new Map();
	const priceData = await db.select().from(prices).where(inArray(prices.itemId, itemIds));
	const priceMap = new Map();
	for (const p of priceData) {
		priceMap.set(p.itemId, p);
	}
	return priceMap;
}

// GET - Fetch all flips with calculated costs/profit
export const GET = async () => {
	const allFlips = await db.select().from(flips).orderBy(desc(flips.createdAt));

	// Get all unique item IDs to fetch prices
	const outputItemIds = allFlips.map(f => f.outputItemId);
	const inputItemIds = [...new Set(allFlips.flatMap(f => f.inputItems.map((i: any) => i.itemId)))];
	const allItemIds = [...new Set([...outputItemIds, ...inputItemIds])];

	const priceMap = await getPricesForItems(allItemIds);

	// Calculate costs and profits for each flip
	const flipsWithCalculations = allFlips.map(flip => {
		// Calculate input cost (buy prices)
		let totalInputCost = 0;
		for (const input of flip.inputItems) {
			const price = priceMap.get(input.itemId);
			if (price?.buyPrice) {
				totalInputCost += price.buyPrice * input.quantity;
			}
		}

		// Calculate output revenue (sell price)
		const outputPrice = priceMap.get(flip.outputItemId);
		const outputRevenue = (outputPrice?.sellPrice || 0) * (flip.outputQuantity ?? 1);

		// Profit = revenue - input cost
		const profit = outputRevenue - totalInputCost;

		return {
			...flip,
			totalInputCost,
			outputRevenue,
			profit
		};
	});

	return json(flipsWithCalculations);
};

// POST - Create a new craft flip
export const POST = async ({ request }) => {
	const body = await request.json();

	const newFlip = await db.insert(flips).values({
		outputItemId: body.outputItemId,
		outputItemName: body.outputItemName || body.outputItemId,
		inputItems: body.inputItems || [],
		outputQuantity: body.outputQuantity ?? 1,
		isActive: body.isActive ?? true,
		notes: body.notes || null
	}).returning();

	return json(newFlip[0], { status: 201 });
};

// PUT - Update an existing craft flip
export const PUT = async ({ request }) => {
	const body = await request.json();

	if (!body.id) {
		return json({ error: 'Flip ID is required' }, { status: 400 });
	}

	const updatedFlip = await db.update(flips)
		.set({
			outputItemId: body.outputItemId,
			outputItemName: body.outputItemName,
			inputItems: body.inputItems,
			outputQuantity: body.outputQuantity ?? 1,
		})
		.where(eq(flips.id, body.id))
		.returning();

	if (updatedFlip.length === 0) {
		return json({ error: 'Flip not found' }, { status: 404 });
	}

	return json(updatedFlip[0]);
};

// DELETE - Delete a flip
export const DELETE = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Flip ID is required' }, { status: 400 });
	}

	const deletedFlip = await db.delete(flips).where(eq(flips.id, parseInt(id))).returning();

	if (deletedFlip.length === 0) {
		return json({ error: 'Flip not found' }, { status: 404 });
	}

	return json({ success: true, deleted: deletedFlip[0] });
};
