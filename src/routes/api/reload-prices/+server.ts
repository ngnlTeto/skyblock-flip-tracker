import { db } from '#lib/server/db/index.js';
import { pricesTable } from '#lib/server/db/schema.js';
import { getAuctionPrices, getBazaarPrices } from '#lib/server/skyblock-api/index.js';
import type { RequestHandler } from './$types';
import { removeDupplicateItems } from '#lib/utils.js';

export const GET: RequestHandler = async () => {
	console.time('Fetching bazaar prices');
	const bazaarPrices = await getBazaarPrices();
	console.timeEnd('Fetching bazaar prices');

	console.time('Fetching auction prices');
	const auctionPrices = await getAuctionPrices();
	console.timeEnd('Fetching auction prices');

	const priceList = removeDupplicateItems([...bazaarPrices, ...auctionPrices]);

	await db.delete(pricesTable);
	await db.insert(pricesTable).values(priceList);

	return new Response('Prices successfully reloaded');
};
