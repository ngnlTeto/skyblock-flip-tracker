<script lang="ts">
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import { Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import EditFlipDialog from '$lib/components/edit-flip-dialog.svelte';
	import type { ItemPrice } from '$lib/types/db';
	import { type Flip, FlipCategory, getCategoryInfo } from '$lib/flip';
	import { invalidateAll } from '$app/navigation';
	import { betterMax, sum } from '$lib/utils';

	let { data }: PageProps = $props();

	const itemMap: Map<string, ItemPrice> = $derived(new Map(data.items.map((i) => [i.itemId, i])));

	let flips = $state<Flip[]>([]);

	onMount(() => {
		flips = JSON.parse(localStorage.getItem('flips') ?? '[]');
	});

	$effect(() => {
		localStorage.setItem('flips', JSON.stringify(flips));
	});

	const flipPrices = $derived(
		flips.map((flip) => {
			const outputItem = {
				...itemMap.get(flip.outputItem.itemId!)!,
				quantity: flip.outputItem.quantity
			};
			const inputItems = flip.inputItems.map((i) => ({
				...itemMap.get(i.itemId!)!,
				quantity: flip.outputItem.quantity
			}));

			const totalInputPrice = sum(inputItems.map((i) => i.buyPrice ?? 0));

			return {
				id: flip.id,
				outputItem,
				inputItems,
				category: flip.category,
				isActive: flip.isActive,
				notes: flip.notes,
				profit:
					outputItem.sellPrice !== null && outputItem.sellPrice !== undefined
						? outputItem.sellPrice - sum(inputItems.map((i) => i.buyPrice ?? 0))
						: null,
				totalInputPrice
			};
		})
	);
	const activeFlipPrices = $derived(flipPrices.filter((f) => f.isActive));

	let searchQuery = $state('');
	let isReloading = $state(false);

	// Dialog state
	let showDialog = $state(false);
	let editingFlip = $state<Flip | null>(null);
	let addNewFlipDialog = $state(false);

	// Filtered flips based on search
	const filteredFlips = $derived(
		flipPrices.filter(
			(flip) =>
				flip.outputItem.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
				flip.outputItem.itemName.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function getNewFlip(): Flip {
		return {
			id: crypto.randomUUID(),
			category: undefined,
			outputItem: {
				itemId: undefined,
				quantity: 1
			},
			inputItems: [],
			isActive: true,
			notes: ''
		};
	}

	// Format currency
	function formatCoins(amount: number | null) {
		if (amount === null) return 'N/A';
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function getProfitColor(profit: number | null) {
		if (profit === null) return 'text-muted-foreground';
		return profit >= 0 ? 'text-green-500' : 'text-red-500';
	}

	function openDialog(flip: Flip, addNewFlip = false) {
		editingFlip = flip;
		showDialog = false; // Reset dialog state to trigger re-render
		showDialog = true;
		addNewFlipDialog = addNewFlip;
	}

	// Save flip (create or update)
	async function saveFlip(flip: Flip) {
		const index = flips.findIndex((f) => f.id === flip.id);

		if (index === -1) {
			flips = [...flips, flip];
		} else {
			flips[index] = flip;
		}
	}

	async function deleteFlip(id: string) {
		if (!confirm('Are you sure you want to delete this flip?')) return;

		const index = flips.findIndex((f) => f.id === id);
		flips.splice(index, 1);
	}

	async function reloadPrices() {
		isReloading = true;
		try {
			await fetch('/api/reload-prices', { method: 'GET' });
			invalidateAll();
		} finally {
			isReloading = false;
		}
	}

	const stats = $derived({
		flipCount: flipPrices.length,
		activeFlipCount: activeFlipPrices.length,
		bestFlip: betterMax(activeFlipPrices, (f) => f.profit),
		bestInstantFlip: betterMax(
			activeFlipPrices.filter((f) =>
				[FlipCategory.AUCTION_FLIP, FlipCategory.BAZAAR_FLIP, FlipCategory.CRAFT_FLIP].includes(f.category!)
			),
			(f) => f.profit
		),
		bestForgeFlip: betterMax(
			activeFlipPrices.filter((f) => f.category === FlipCategory.FORGE_FLIP),
			(f) => f.profit
		)
	});
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">SkyBlock Craft Flip Tracker</h1>
			<p class="text-muted-foreground">Track and manage your hypixel skyblock craft flips</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="icon" onclick={reloadPrices} disabled={isReloading} title="Reload Prices">
				<RefreshCw class="h-4 w-4 {isReloading ? 'animate-spin' : ''}" />
			</Button>
			<Button onclick={() => openDialog(getNewFlip(), true)}>
				<Plus class="mr-2 h-4 w-4" />
				Add Craft Flip
			</Button>
		</div>
	</div>

	<!-- Statistics Cards -->
	<div class="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium">Total Flips</Card.Title>
				<Card.Description>All tracked flips</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.flipCount}</div>
				<p class="text-xs text-muted-foreground">{stats.activeFlipCount} active</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium">Best Flip</Card.Title>
				<Card.Description>Highest potential profit</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if stats.bestFlip}
					<div class="text-2xl font-bold {getProfitColor(stats.bestFlip.profit)}">
						{formatCoins(stats.bestFlip.profit || 0)}
					</div>
					<p class="text-xs text-muted-foreground">{stats.bestFlip.outputItem.itemName}</p>
				{:else}
					<div class="text-2xl font-bold">-</div>
					<p class="text-xs text-muted-foreground">No flips yet</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium">Best Instant Flip</Card.Title>
				<Card.Description>No forge flips</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if stats.bestInstantFlip}
					<div class="text-2xl font-bold {getProfitColor(stats.bestInstantFlip.profit)}">
						{formatCoins(stats.bestInstantFlip.profit)}
					</div>
					<p class="text-xs text-muted-foreground">{stats.bestInstantFlip.outputItem.itemName}</p>
				{:else}
					<div class="text-2xl font-bold">-</div>
					<p class="text-xs text-muted-foreground">No flips yet</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium">Best Forge Flip</Card.Title>
				<Card.Description>Only forge flips</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if stats.bestForgeFlip}
					<div class="text-2xl font-bold {getProfitColor(stats.bestForgeFlip.profit)}">
						{formatCoins(stats.bestForgeFlip.profit)}
					</div>
					<p class="text-xs text-muted-foreground">{stats.bestForgeFlip.outputItem.itemName}</p>
				{:else}
					<div class="text-2xl font-bold">-</div>
					<p class="text-xs text-muted-foreground">No flips yet</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Search and Filters -->
	<div class="mb-4 flex items-center gap-4">
		<div class="relative max-w-sm flex-1">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input placeholder="Search flips..." bind:value={searchQuery} class="pl-10" />
		</div>
	</div>

	<!-- Flips Table -->
	<Card.Root class="py-0">
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Output Item</Table.Head>
						<Table.Head>Category</Table.Head>
						<Table.Head>Input Items</Table.Head>
						<Table.Head class="text-right">Input Cost</Table.Head>
						<Table.Head class="text-right">Output Value</Table.Head>
						<Table.Head class="text-right">Profit</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filteredFlips as flip (flip.id)}
						<Table.Row>
							<Table.Cell class="font-medium">
								<div>{flip.outputItem.itemName}</div>
								<div class="text-xs text-muted-foreground">{flip.outputItem.itemId}</div>
								<div class="text-xs text-muted-foreground">×{flip.outputItem.quantity}</div>
							</Table.Cell>
							<Table.Cell>
								{#if flip.category}
									{@const categoryInfo = getCategoryInfo(flip.category)}
									<categoryInfo.icon class="h-5 w-5 {categoryInfo.color}" />
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap gap-1">
									{#each flip.inputItems as input (input.itemId)}
										<span class="inline-flex flex-col items-start gap-0.5 rounded bg-secondary px-2 py-0.5 text-xs">
											<div class="flex items-center gap-1">
												{input.itemName}
												<span class="text-muted-foreground">×{input.quantity}</span>
											</div>
											<div class="text-muted-foreground">
												{formatCoins(input.buyPrice !== null ? input.buyPrice * input.quantity : null)} coins
											</div>
										</span>
									{/each}
								</div>
							</Table.Cell>
							<Table.Cell class="text-right">{formatCoins(flip.totalInputPrice || 0)}</Table.Cell>
							<Table.Cell class="text-right">{formatCoins(flip.outputItem.sellPrice || 0)}</Table.Cell>
							<Table.Cell class="text-right {getProfitColor(flip.profit)}">
								{formatCoins(flip.profit || 0)}
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex items-center justify-end gap-2">
									<Button variant="ghost" size="icon" onclick={() => openDialog(flip)}>
										<Pencil class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="icon" onclick={() => deleteFlip(flip.id)}>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={7} class="text-center py-8 text-muted-foreground">
								No craft flips found. Add your first craft flip to get started!
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

<EditFlipDialog
	open={showDialog}
	isAddingDialog={!addNewFlipDialog}
	editingFlip={editingFlip!}
	itemPrices={data.items}
	{saveFlip}
/>
