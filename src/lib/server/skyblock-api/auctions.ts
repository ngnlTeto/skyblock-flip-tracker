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
			// Skip auctions without any bids
			if (auction.bids.length === 0) {
				continue;
			}

			// Get the highest bid (last bid in the array is the current highest)
			const latestBid = auction.bids[auction.bids.length - 1];
			const buyPrice = latestBid.amount;
			const sellPrice = auction.bin ? auction.starting_bid : auction.highest_bid_amount;

			pricesMap.set(auction.item_name, {
				buyPrice,
				sellPrice
			});
		}
	}
	return pricesMap;
}
