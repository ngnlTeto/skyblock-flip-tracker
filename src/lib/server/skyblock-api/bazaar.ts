import type { BazaarResponse, Prices } from '$lib/types/api';
import { instaFetch } from '$lib/utils';

export async function getBazaarPrices() {
	const bazaarResponse: BazaarResponse = await instaFetch('https://api.hypixel.net/v2/skyblock/bazaar');

	const priceMap = new Map<string, Prices>();

	for (const [productId, product] of Object.entries(bazaarResponse.products)) {
		priceMap.set(productId, {
			buyPrice: product.quick_status.sellPrice,
			sellPrice: product.quick_status.buyPrice
		});
	}

	return priceMap;
}
