import { db } from '$lib/server/db';
import { pricesTable } from '$lib/server/db/schema';
import { getAuctionPrices, getBazaarPrices } from '$lib/server/skyblock-api';
import { writeFileSync } from 'fs';
import type { RequestHandler } from './$types';
import { cleanBazaarPrices } from '$lib/edge-cases';
import { removeDupplicateItems } from '$lib/utils';

export const GET: RequestHandler = async () => {
	console.time('Fetching bazaar prices');
	const bazaarPrices = cleanBazaarPrices(await getBazaarPrices());
	console.timeEnd('Fetching bazaar prices');

	console.time('Fetching auction prices');
	const auctionPrices = await getAuctionPrices();
	console.timeEnd('Fetching auction prices');

	const priceList = removeDupplicateItems([...bazaarPrices, ...auctionPrices]);

	await db.delete(pricesTable);
	await db.insert(pricesTable).values(priceList);

	return new Response('Prices successfully reloaded');
};
