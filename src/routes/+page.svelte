<script lang="ts">
	import type { Prices } from '$lib/types/api';
	import type { PageProps } from './$types';
	import { getAuctionPrices } from './auction.remote';

	let { data }: PageProps = $props();

	const auctionQuery = getAuctionPrices();

	const prices = $derived(
		new Map<string, Prices>([
			...(auctionQuery.ready ? auctionQuery.current : []),
			...data.bazaarPrices
		])
	);

	$inspect(auctionQuery.current);
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
{JSON.stringify(prices)}
