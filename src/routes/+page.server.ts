import type { BazaarResponse, Prices } from '$lib/types/api';
import { instaFetch } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const bazaarResponse: BazaarResponse = await instaFetch(
		'https://api.hypixel.net/v2/skyblock/bazaar'
	);

	const priceMap = new Map<string, Prices>();

	for (const [productId, product] of Object.entries(bazaarResponse.products)) {
		priceMap.set(productId, {
			buyPrice: product.quick_status.buyPrice,
			sellPrice: product.quick_status.sellPrice
		});
	}

	return { bazaarPrices: priceMap };
}) satisfies PageServerLoad;
