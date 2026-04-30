import type { AuctionsResponse, Prices } from '$lib/types/api';
import { instaFetch } from '$lib/utils';

export async function getAuctionPrices(): Promise<Map<string, Prices>> {
	const pricesMap = new Map<string, Prices>();

	// Fetch first page to get totalPages
	const firstResponse: AuctionsResponse = await instaFetch(
		'https://api.hypixel.net/v2/skyblock/auctions?page=0'
	);

	if (!firstResponse.success) {
		throw new Error('Failed to fetch auction data');
	}

	const totalPages = firstResponse.totalPages;

	// Fetch all pages sequentially
	for (let page = 0; page < totalPages; page++) {
		const response: AuctionsResponse = await instaFetch(
			`https://api.hypixel.net/v2/skyblock/auctions?page=${page}`
		);

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
			const existing = pricesMap.get(itemName);
			if (!existing || price < existing.buyPrice) {
				pricesMap.set(itemName, {
					buyPrice: price,
					sellPrice: price
				});
			}
		}
	}
	return pricesMap;
}
