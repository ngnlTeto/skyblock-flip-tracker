import { db } from '$lib/server/db';
import { pricesTable } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {
		items: await db.select().from(pricesTable)
	};
}) satisfies PageServerLoad;
