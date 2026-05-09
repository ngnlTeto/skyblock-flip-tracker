import type { BazaarResponse, Prices } from '$lib/types/api';
import type { ItemPrice } from '$lib/types/db';
import { instaFetch } from '$lib/utils';
import { getItems } from './items';

export async function getBazaarPrices(): Promise<ItemPrice[]> {
	const bazaarResponse: BazaarResponse = await instaFetch('https://api.hypixel.net/v2/skyblock/bazaar');
	const items = await getItems();

	const priceList: ItemPrice[] = [];

	for (const [productId, product] of Object.entries(bazaarResponse.products)) {
		priceList.push({
			itemId: productId,
			itemName: items.get(productId)!,
			buyPrice: product.quick_status.sellPrice,
			sellPrice: product.quick_status.buyPrice
		});
	}

	return priceList;
}
