import type { AuctionsResponse } from '$lib/types/api';
import { instaFetch } from '$lib/utils';
import { gunzipSync } from 'zlib';
import { parse } from 'prismarine-nbt';
import type { ItemPrice } from '$lib/types/db';
import { getItems } from './items';

export async function getAuctionPrices(): Promise<ItemPrice[]> {
	const pricesList: ItemPrice[] = [];
	const firstResponse: AuctionsResponse = await instaFetch('https://api.hypixel.net/v2/skyblock/auctions?page=0');

	const itemMap = await getItems();

	if (!firstResponse.success) {
		throw new Error('Failed to fetch auction data');
	}

	const totalPages = firstResponse.totalPages;

	// Fetch all pages sequentially
	for (let page = 0; page < totalPages; page++) {
		const response: AuctionsResponse = await instaFetch(`https://api.hypixel.net/v2/skyblock/auctions?page=${page}`);

		if (!response.success) {
			throw new Error(`Failed to fetch auction data for page ${page}`);
		}

		// Process each auction
		for (const auction of response.auctions) {
			// Only process BIN (Buy It Now) auctions - they don't require bids
			if (!auction.bin) {
				continue;
			}

			const itemName = auction.item_name;
			const price = auction.starting_bid;

			// Only keep the lowest BIN price for each item
			const existing = pricesList.find((p) => p.itemName === itemName);
			if (!existing || price < existing.buyPrice) {
				const itemId = await extractItemId(auction.item_bytes);
				pricesList.push({
					itemId,
					itemName: itemMap.get(itemId)!,
					buyPrice: price,
					sellPrice: price
				});
			}
		}
	}
	return pricesList;
}

async function extractItemId(itemBytes: string): Promise<string> {
	const nbtData = await extractItemBytes(itemBytes);
	return nbtData.parsed.value.i.value.value.at(0).tag.value.ExtraAttributes.id.value;
}

async function extractItemBytes(itemBytes: string): Promise<any> {
	const buffer = Buffer.from(itemBytes, 'base64');
	const decompressed = gunzipSync(buffer);
	return await parse(decompressed);
}
