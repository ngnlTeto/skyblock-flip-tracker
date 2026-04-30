<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Search, X } from 'lucide-svelte';

	interface Props {
		items: { itemId: string }[];
		value: string;
		placeholder?: string;
		onchange: (itemId: string) => void;
	}

	let { items, value, placeholder = 'Search items...', onchange }: Props = $props();

	let searchQuery = $state('');
	let isOpen = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);

	let filteredItems = $derived(
		searchQuery
			? items.filter(item =>
				item.itemId.toLowerCase().includes(searchQuery.toLowerCase())
			).slice(0, 20) // Limit to 20 items for performance
			: items.slice(0, 20)
	);

	function selectItem(itemId: string) {
		onchange(itemId);
		searchQuery = '';
		isOpen = false;
	}

	function clearSelection() {
		onchange('');
		searchQuery = '';
		isOpen = false;
	}

	function getSelectedItemName(): string {
		if (!value) return '';
		const item = items.find(i => i.itemId === value);
		return item?.itemId || value;
	}
</script>

<div class="relative">
	{#if value}
		<!-- Show selected item as badge -->
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-1 px-3 py-2 rounded-md border bg-background min-h-10 flex-1">
				<span class="font-medium">{getSelectedItemName()}</span>
			</div>
			<button
				type="button"
				class="p-2 rounded-md border hover:bg-accent"
				onclick={clearSelection}
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{:else}
		<!-- Search input when nothing selected -->
		<div class="relative">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				bind:ref={inputRef}
				bind:value={searchQuery}
				{placeholder}
				class="pl-10"
				onfocus={() => isOpen = true}
				onblur={() => setTimeout(() => isOpen = false, 200)}
			/>
		</div>
	{/if}

	<!-- Dropdown results -->
	{#if isOpen && searchQuery && filteredItems.length > 0}
		<div class="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-background shadow-lg">
			{#each filteredItems as item}
				<button
					type="button"
					class="w-full px-3 py-2 text-left hover:bg-accent focus:bg-accent"
					onmousedown={() => selectItem(item.itemId)}
				>
					{item.itemId}
				</button>
			{/each}
		</div>
	{/if}

	{#if isOpen && searchQuery && filteredItems.length === 0}
		<div class="absolute z-50 w-full mt-1 rounded-md border bg-background shadow-lg p-3 text-center text-muted-foreground text-sm">
			No items found
		</div>
	{/if}
</div>
