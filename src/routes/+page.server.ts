import { db } from '#lib/server/db/index.js';
import { pricesTable } from '#lib/server/db/schema.js';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {
		items: await db.select().from(pricesTable)
	};
}) satisfies PageServerLoad;
