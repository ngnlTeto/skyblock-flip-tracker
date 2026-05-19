<script lang="ts">
	import { Plus, Trash } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import ItemSearch from '$lib/components/item-search.svelte';
	import { FlipCategory, getCategoryInfo, type Flip } from '$lib/flip';
	import type { ItemPrice } from '$lib/types/db';

	let {
		open,
		isAddingDialog,
		editingFlip,
		itemPrices,
		saveFlip
	}: {
		open: boolean;
		isAddingDialog: boolean;
		editingFlip: Flip;
		itemPrices: ItemPrice[];
		saveFlip: (flip: Flip) => void;
	} = $props();

	let flip = $derived(editingFlip);

	const items = $derived(itemPrices.map((i) => ({ itemId: i.itemId, itemName: i.itemName })));

	const categories = [
		{ value: FlipCategory.AUCTION_FLIP, label: 'Auction flip' },
		{ value: FlipCategory.BAZAAR_FLIP, label: 'Bazaar flip' },
		{ value: FlipCategory.CRAFT_FLIP, label: 'Craft flip' },
		{ value: FlipCategory.FORGE_FLIP, label: 'Forge flip' }
	];
	const selectedCategory = $derived(categories.find((c) => c.value === flip.category)?.label ?? 'Select a category');

	const categoryInfo = $derived(getCategoryInfo(flip.category));

	function addInputItem() {
		flip.inputItems = [...flip.inputItems, { itemId: undefined, quantity: 1 }];
	}

	function onInputItemSelect(index: number, itemId: string | undefined) {
		flip.inputItems[index].itemId = itemId;
	}

	function removeInputItem(index: number) {
		flip.inputItems = flip.inputItems.filter((_, i) => i !== index);
	}

	function saveFlipWithValidation(): void {
		// TODO Implement...
		saveFlip(flip);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-150">
		<Dialog.Header>
			<Dialog.Title>{isAddingDialog ? 'Edit Craft Flip' : 'Add New Craft Flip'}</Dialog.Title>
			<Dialog.Description>
				{isAddingDialog
					? 'Update the craft flip details below.'
					: 'Add a new craft flip. Select output item and input ingredients from your prices table.'}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
			<!-- Output Item -->
			<div class="grid gap-2">
				<label for="outputItem" class="text-sm font-medium">Output Item (Result)</label>
				<ItemSearch
					{items}
					value={flip.outputItem?.itemId}
					placeholder="Search output item..."
					onchange={(itemId) => {
						flip.outputItem.itemId = itemId;
					}}
				/>
			</div>

			<!-- Output Quantity -->
			<div class="grid gap-2">
				<label for="outputQuantity" class="text-sm font-medium">Output Quantity</label>
				<Input id="outputQuantity" type="number" min="1" bind:value={flip.outputItem.quantity} />
			</div>

			<!-- Input Items -->
			<div class="grid gap-2">
				<div class="flex items-center justify-between">
					<label for="input-items" class="text-sm font-medium">Input Items (Ingredients)</label>
					<Button variant="outline" size="sm" onclick={addInputItem}>
						<Plus class="mr-1 h-4 w-4" /> Add Ingredient
					</Button>
				</div>
				<div class="space-y-2">
					{#each flip.inputItems as input, index (index)}
						<div class="flex items-center gap-2">
							<ItemSearch
								{items}
								value={input.itemId}
								placeholder="Search ingredient..."
								onchange={(itemId) => onInputItemSelect(index, itemId)}
							/>
							<Input type="number" min="1" class="w-20" bind:value={input.quantity} />
							<Button variant="ghost" size="icon" onclick={() => removeInputItem(index)}>
								<Trash />
							</Button>
						</div>
					{/each}
					{#if flip.inputItems.length === 0}
						<p class="text-sm text-muted-foreground">
							No ingredients added. Click "Add Ingredient" to add input items.
						</p>
					{/if}
				</div>
			</div>

			<!-- Category -->
			<div class="flex flex-row items-end gap-4">
				<categoryInfo.icon color={categoryInfo.color} class="size-10" />
				<div class="grid gap-2">
					<Label for="category">Category</Label>
					<Select.Root type="single" name="category" bind:value={flip.category}>
						<Select.Trigger class="w-45">
							{selectedCategory}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Fruits</Select.Label>
								{#each categories as category (category.value)}
									<Select.Item value={category.value} label={category.label}>
										{category.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<!-- Notes -->
			<div class="grid gap-2">
				<label for="notes" class="text-sm font-medium">Notes (optional)</label>
				<Input id="notes" placeholder="Any additional notes..." bind:value={flip.notes} />
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={saveFlipWithValidation}>
				{isAddingDialog ? 'Save Changes' : 'Add Craft Flip'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
