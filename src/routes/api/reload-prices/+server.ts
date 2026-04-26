import { db } from '$lib/server/db';
import { prices } from '$lib/server/db/schema';
import { getAuctionPrices, getBazaarPrices } from '$lib/server/skyblock-api';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('Authorization');
	const cronSecret = env.CRON_SECRET;

	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	const bazaarPrices = await getBazaarPrices();
	const auctionPrices = await getAuctionPrices();

	const currentPrices = new Map([...bazaarPrices, ...auctionPrices]);
	const priceList = Array.from(currentPrices).map((p) => ({
		itemId: p[0],
		buyPrice: p[1].buyPrice,
		sellPrice: p[1].sellPrice
	}));

	await db.delete(prices);
	await db.insert(prices).values(priceList);

	return new Response('Prices successfully reloaded');
};
