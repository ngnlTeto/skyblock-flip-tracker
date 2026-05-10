import type { Auction, AuctionsResponse } from '$lib/types/api';
import { instaFetch, itemIdToName, removeDupplicateItems } from '$lib/utils';
import { gunzipSync } from 'zlib';
import { parse } from 'prismarine-nbt';
import type { ItemPrice } from '$lib/types/db';
import { getItems } from './items';
import { writeFileSync } from 'fs';

export async function getAuctionPrices(): Promise<ItemPrice[]> {
	const firstResponse: AuctionsResponse = await instaFetch('https://api.hypixel.net/v2/skyblock/auctions?page=0');

	const itemMap = await getItems();
	writeFileSync(
		'C:/Users/henry/source/repos/skyblock-data-analysis/items.test.json',
		JSON.stringify(Object.fromEntries(itemMap), null, 2)
	);

	if (!firstResponse.success) {
		throw new Error('Failed to fetch auction data');
	}

	const totalPages = firstResponse.totalPages;

	const bestAuctions: Auction[] = [];

	// Fetch all pages sequentially
	for (let page = 0; page < totalPages; page++) {
		const response: AuctionsResponse = await instaFetch(`https://api.hypixel.net/v2/skyblock/auctions?page=${page}`);

		if (!response.success) {
			throw new Error(`Failed to fetch auction data for page ${page}`);
		}

		// Process each auction
		for (const auction of response.auctions) {
			// Only process BIN (Buy It Now) auctions - they don't require bids
			if (!auction.bin) continue;

			const existing = bestAuctions.find((p) => p.item_name === auction.item_name);

			if (existing === undefined) {
				bestAuctions.push(auction);
				continue;
			}

			if (auction.starting_bid < existing.starting_bid) {
				bestAuctions.splice(bestAuctions.indexOf(existing), 1, auction);
			}
		}
	}

	// map best auctions to item prices and set better IDs 😭
	const pricesList: ItemPrice[] = [];
	for (const auction of bestAuctions) {
		const nbtData = await extractItemBytes(auction.item_bytes);
		const extraAttributes = nbtData?.parsed?.value?.i?.value?.value?.at(0)?.tag?.value?.ExtraAttributes?.value;
		let itemId: string = extraAttributes?.id?.value;
		let itemName = itemMap.get(itemId) ?? auction.item_name;

		if (itemId === 'PET') {
			const petInfo = JSON.parse(extraAttributes?.petInfo?.value);
			itemId = `${petInfo.tier}_${petInfo.type}_PET`;
			itemName = itemIdToName(itemId);
		}

		if (itemId === 'RUNE') {
			const runeType: string = Object.keys(extraAttributes?.runes?.value)[0];
			const runeLevel: number = extraAttributes?.runes?.value[runeType]?.value;
			itemId = `${runeType}_${runeLevel}_RUNE`;
			itemName = itemIdToName(itemId);
		}

		pricesList.push({
			itemId,
			itemName,
			buyPrice: auction.starting_bid,
			sellPrice: auction.starting_bid
		});
	}

	return removeDupplicateItems(pricesList);
}

async function extractItemBytes(itemBytes: string): Promise<any> {
	const buffer = Buffer.from(itemBytes, 'base64');
	const decompressed = gunzipSync(buffer);
	return await parse(decompressed);
}
