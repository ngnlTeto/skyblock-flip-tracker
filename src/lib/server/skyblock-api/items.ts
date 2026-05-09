import type { ItemsResponse } from '$lib/types/api';
import { instaFetch } from '$lib/utils';

export async function getItems(): Promise<Map<string, string>> {
	const itemsResponse: ItemsResponse = await instaFetch('https://api.hypixel.net/v2/skyblock/bazaar');
	return new Map(itemsResponse.items.map((i) => [i.id, i.name]));
}
