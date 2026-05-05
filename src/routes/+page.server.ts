import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { flips, prices } from '$lib/server/db/schema';
import { desc, inArray } from 'drizzle-orm';

export const load = (async () => {
	// Fetch all flips ordered by creation date
	const allFlips = await db.select().from(flips).orderBy(desc(flips.createdAt));

	// Fetch all prices for reference
	const allPrices = await db.select().from(prices);

	// Create price map for quick lookup
	const priceMap = new Map();
	for (const p of allPrices) {
		priceMap.set(p.itemId, p);
	}

	// Calculate costs and profits for each flip
	const flipsWithCalculations = allFlips.map((flip) => {
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

	// Calculate statistics
	const totalFlips = allFlips.length;
	const activeFlips = allFlips.filter((f) => f.isActive).length;
	const totalPotentialProfit = flipsWithCalculations.reduce((sum, flip) => {
		return sum + (flip.profit || 0);
	}, 0);
	const avgProfit = totalFlips > 0 ? totalPotentialProfit / totalFlips : 0;

	// Find best flip
	const bestFlip = flipsWithCalculations.reduce(
		(best, flip) => {
			const profit = flip.profit ?? 0;
			const bestProfit = best ? (best.profit ?? 0) : 0;
			return profit > bestProfit ? flip : best;
		},
		null as (typeof flipsWithCalculations)[0] | null
	);

	return {
		flips: flipsWithCalculations,
		prices: allPrices,
		stats: {
			totalFlips,
			activeFlips,
			totalPotentialProfit,
			avgProfit,
			bestFlip
		}
	};
}) satisfies PageServerLoad;
