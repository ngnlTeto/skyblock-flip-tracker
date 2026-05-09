import { db } from '$lib/server/db';
import { pricesTable } from '$lib/server/db/schema';
import { getAuctionPrices, getBazaarPrices } from '$lib/server/skyblock-api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const bazaarPrices = await getBazaarPrices();
	const auctionPrices = await getAuctionPrices();

	const priceList = [...bazaarPrices, ...auctionPrices];

	await db.delete(pricesTable);
	await db.insert(pricesTable).values(priceList);

	return new Response('Prices successfully reloaded');
};
