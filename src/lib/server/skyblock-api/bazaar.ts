import type { BazaarResponse } from '$lib/types/api';
import type { ItemPrice } from '$lib/types/db';
import { instaFetch, itemIdToName } from '$lib/utils';
import { getItems } from './items';

const enchantmentRegex = /^ENCHANTMENT_(?<enchantment_name>[A-Z_]+)_(?<enchantment_level>\d+)$/;

export async function getBazaarPrices(): Promise<ItemPrice[]> {
	const bazaarResponse: BazaarResponse = await instaFetch('https://api.hypixel.net/v2/skyblock/bazaar');
	const items = await getItems();

	const priceList: ItemPrice[] = Object.entries(bazaarResponse.products).map(([productId, product]) => ({
		itemId: productId,
		itemName: items.get(productId)!,
		buyPrice: product.quick_status.sellPrice,
		sellPrice: product.quick_status.buyPrice
	}));

	return cleanBazaarEdgeCases(priceList);
}

function cleanBazaarEdgeCases(items: ItemPrice[]): ItemPrice[] {
	// Hypixel forgot to put it in the items API...
	const sleepyHollowIndex = items.findIndex((i) => i.itemId === 'SLEEPY_HOLLOW');
	items[sleepyHollowIndex].itemName = 'Sleepy Hollow';

	// Deprecated and only existes for backwards compatibility...
	const bazaarCookieIndex = items.findIndex((i) => i.itemId === 'BAZAAR_COOKIE');
	items.splice(bazaarCookieIndex, 1);

	// The items API have no entries for entchantments
	for (const item of items) {
		if (!item.itemId.startsWith('ENCHANTMENT_')) continue;

		const regexResult = item.itemId.match(enchantmentRegex);
		if (regexResult === null) throw new Error(`Enchantment regex failed to execute on '${item.itemId}'`);

		const regexGroups = regexResult.groups as { enchantment_name: string; enchantment_level: string };
		item.itemName = `${itemIdToName(regexGroups.enchantment_name)} ${regexGroups.enchantment_level}`;
	}

	// The items API have no entries for shards
	for (const item of items) {
		if (!item.itemId.startsWith('SHARD_')) continue;

		const shardName = itemIdToName(item.itemId.replaceAll('SHARD_', ''));
		item.itemName = `${shardName} Shard`;
	}

	// The items API have no entries for essence
	for (const item of items) {
		if (!item.itemId.startsWith('ESSENCE_')) continue;

		const essenceName = itemIdToName(item.itemId.replaceAll('ESSENCE_', ''));
		item.itemName = `${essenceName} Essence`;
	}

	return items;
}
