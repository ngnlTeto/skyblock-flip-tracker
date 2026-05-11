<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { X } from 'lucide-svelte';

	let {
		items,
		value,
		placeholder = 'Search items...',
		onchange
	}: {
		items: { itemId: string; itemName: string }[];
		value: string | undefined;
		placeholder?: string;
		onchange: (itemId: string | undefined) => void;
	} = $props();

	let currentValue = $derived(value);

	let searchQuery = $state('');
	let open = $state(false);

	function simplify(text: string): string {
		return text.toLowerCase().replaceAll('_', ' ');
	}

	const baseItems = $derived(
		searchQuery
			? items.filter((item) => {
					const simplifiedName = simplify(item.itemName);
					const simplifiedId = simplify(item.itemId);
					const simplifiedQuery = simplify(searchQuery);

					return simplifiedName.includes(simplifiedQuery) || simplifiedId.includes(simplifiedQuery);
				})
			: items
	);
	const filteredItems = $derived(baseItems.slice(0, 50)); // Limit to 50 items for performance

	function selectItem(itemId: string) {
		onchange(itemId);
		currentValue = itemId;
		searchQuery = '';
		open = false;
	}

	function clearSelection() {
		onchange(undefined);
		currentValue = undefined;
		searchQuery = '';
		open = false;
	}

	function getSelectedItemName(): string {
		if (!value) return '';
		const item = items.find((i) => i.itemId === value)!;
		return item.itemName;
	}
</script>

<div class="flex flex-row items-center gap-2">
	<Popover.Root bind:open>
		<Popover.Trigger>
			<Button variant="outline" class="w-56 justify-start" title={currentValue}>
				{value ? getSelectedItemName() : placeholder}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="gap-0 p-0">
			<Input class="m-2 w-[94%]" bind:value={searchQuery} placeholder="Search item..." />
			{#if filteredItems.length > 0}
				<div class="mt-1 max-h-60 w-full overflow-x-hidden overflow-y-auto shadow-lg">
					{#each filteredItems as item (item.itemId)}
						<button
							type="button"
							class="w-full px-3 py-2 text-left hover:bg-accent focus:bg-accent"
							onclick={() => selectItem(item.itemId)}
							title={item.itemName}
						>
							{item.itemName}
						</button>
					{/each}
				</div>
			{:else}
				<div class="w-full rounded-md border p-4 text-center text-sm text-muted-foreground shadow-lg">
					No items found
				</div>
			{/if}
		</Popover.Content>
	</Popover.Root>
	{#if value}
		<Button variant="outline" size="icon" onclick={clearSelection}>
			<X />
		</Button>
	{/if}
</div>
