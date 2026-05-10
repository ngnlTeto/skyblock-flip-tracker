import { db } from '$lib/server/db';
import { pricesTable } from '$lib/server/db/schema';
import { getAuctionPrices, getBazaarPrices } from '$lib/server/skyblock-api';
import { writeFileSync } from 'fs';
import type { RequestHandler } from './$types';
import { cleanBazaarPrices } from '$lib/edge-cases';

export const GET: RequestHandler = async () => {
	const bazaarPrices = await getBazaarPrices();
	// const auctionPrices = await getAuctionPrices();

	const cleanedBazaarPrices = cleanBazaarPrices(bazaarPrices)

	const priceList = [...cleanedBazaarPrices]; // ...auctionPrices
	// writeFileSync("C:/Users/henry/source/repos/skyblock-data-analysis/prices.test.json", JSON.stringify(priceList, null, 2));
	await db.delete(pricesTable);
	await db.insert(pricesTable).values(priceList);

	return new Response('Prices successfully reloaded');
};
