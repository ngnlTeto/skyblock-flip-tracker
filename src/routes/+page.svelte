<script lang="ts">
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Plus, Pencil, Trash2, Search, X } from 'lucide-svelte';
	import ItemSearch from '$lib/components/item-search.svelte';

	let { data }: PageProps = $props();

	// Local state for flips (synced from server data)
	let flips = $state(data.flips || []);
	let prices = $state(data.prices || []);
	let searchQuery = $state('');
	let showAddDialog = $state(false);
	let editingFlip = $state<typeof flips[0] | null>(null);

	// Form state for craft flip
	let formData = $state({
		outputItemId: '',
		outputItemName: '',
		inputItems: [] as { itemId: string; itemName: string; quantity: number }[],
		outputQuantity: 1,
		notes: ''
	});

	// Filtered flips based on search
	let filteredFlips = $derived(
		flips.filter(flip =>
			flip.outputItemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(flip.outputItemName && flip.outputItemName.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	// Format currency
	function formatCoins(amount: number) {
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Get price info for an item
	function getPrice(itemId: string) {
		return prices.find(p => p.itemId === itemId);
	}

	// Open add dialog
	function openAddDialog() {
		formData = {
			outputItemId: '',
			outputItemName: '',
			inputItems: [],
			outputQuantity: 1,
			notes: ''
		};
		editingFlip = null;
		showAddDialog = true;
	}

	// Open edit dialog
	function openEditDialog(flip: typeof flips[0]) {
		formData = {
			outputItemId: flip.outputItemId,
			outputItemName: flip.outputItemName || '',
			inputItems: [...flip.inputItems],
			outputQuantity: flip.outputQuantity,
			notes: flip.notes || ''
		};
		editingFlip = flip;
		showAddDialog = true;
	}

	// Add input item to form
	function addInputItem() {
		formData.inputItems = [...formData.inputItems, { itemId: '', itemName: '', quantity: 1 }];
	}

	// Remove input item from form
	function removeInputItem(index: number) {
		formData.inputItems = formData.inputItems.filter((_, i) => i !== index);
	}

	// Update input item when selected from dropdown
	function onInputItemSelect(index: number, itemId: string) {
		const price = getPrice(itemId);
		formData.inputItems[index] = {
			itemId,
			itemName: price?.itemId || itemId,
			quantity: formData.inputItems[index].quantity
		};
	}

	// Save flip (create or update)
	async function saveFlip() {
		const method = editingFlip ? 'PUT' : 'POST';
		const body = {
			...formData,
			id: editingFlip?.id,
			isActive: true
		};

		const res = await fetch('/api/flips', {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (res.ok) {
			const savedFlip = await res.json();
			// Fetch the updated flip with calculations
			const flipRes = await fetch('/api/flips');
			const updatedFlips = await flipRes.json();
			flips = updatedFlips;
			showAddDialog = false;
		}
	}

	// Delete flip
	async function deleteFlip(id: number) {
		if (!confirm('Are you sure you want to delete this flip?')) return;

		const res = await fetch(`/api/flips?id=${id}`, { method: 'DELETE' });
		if (res.ok) {
			flips = flips.filter(f => f.id !== id);
		}
	}

	// Stats from server data
	let stats = $derived(data.stats);
</script>

<div class="container mx-auto py-8 px-4">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold">SkyBlock Craft Flip Tracker</h1>
			<p class="text-muted-foreground">Track and manage your hypixel skyblock craft flips</p>
		</div>
		<Button onclick={openAddDialog}>
			<Plus class="mr-2 h-4 w-4" />
			Add Craft Flip
		</Button>
	</div>

	<!-- Statistics Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium">Total Flips</Card.Title>
				<Card.Description>All tracked craft flips</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats?.totalFlips || 0}</div>
				<p class="text-xs text-muted-foreground">{stats?.activeFlips || 0} active</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium">Total Potential Profit</Card.Title>
				<Card.Description>All active flips</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold {((stats?.totalPotentialProfit || 0) >= 0) ? 'text-green-500' : 'text-red-500'}">
					{formatCoins(stats?.totalPotentialProfit || 0)}
				</div>
				<p class="text-xs text-muted-foreground">Combined profit potential</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium">Average Profit</Card.Title>
				<Card.Description>Per flip</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold {((stats?.avgProfit || 0) >= 0) ? 'text-green-500' : 'text-red-500'}">
					{formatCoins(stats?.avgProfit || 0)}
				</div>
				<p class="text-xs text-muted-foreground">Mean profit per flip</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium">Best Flip</Card.Title>
				<Card.Description>Highest potential profit</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if stats?.bestFlip}
					<div class="text-2xl font-bold text-green-500">
						{formatCoins(stats.bestFlip.profit || 0)}
					</div>
					<p class="text-xs text-muted-foreground">{stats.bestFlip.outputItemId}</p>
				{:else}
					<div class="text-2xl font-bold">-</div>
					<p class="text-xs text-muted-foreground">No flips yet</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Search and Filters -->
	<div class="flex items-center gap-4 mb-4">
		<div class="relative flex-1 max-w-sm">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				placeholder="Search flips..."
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>
	</div>

	<!-- Flips Table -->
	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Output Item</Table.Head>
						<Table.Head>Input Items</Table.Head>
						<Table.Head class="text-right">Input Cost</Table.Head>
						<Table.Head class="text-right">Output Value</Table.Head>
						<Table.Head class="text-right">Profit</Table.Head>
						<Table.Head class="text-right">Margin %</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filteredFlips as flip (flip.id)}
						<Table.Row>
							<Table.Cell class="font-medium">
								<div>{flip.outputItemId}</div>
								{#if flip.outputItemName}
									<div class="text-xs text-muted-foreground">{flip.outputItemName}</div>
								{/if}
								<div class="text-xs text-muted-foreground">×{flip.outputQuantity}</div>
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap gap-1">
									{#each flip.inputItems as input}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-xs">
											{input.itemId}
											<span class="text-muted-foreground">×{input.quantity}</span>
										</span>
									{/each}
								</div>
							</Table.Cell>
							<Table.Cell class="text-right">{formatCoins(flip.totalInputCost || 0)}</Table.Cell>
							<Table.Cell class="text-right">{formatCoins(flip.outputRevenue || 0)}</Table.Cell>
							<Table.Cell class="text-right {(flip.profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}">
								{formatCoins(flip.profit || 0)}
							</Table.Cell>
							<Table.Cell class="text-right">
								{#if flip.totalInputCost > 0}
									{(((flip.profit || 0) / flip.totalInputCost) * 100).toFixed(1)}%
								{:else}
									-
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex items-center justify-end gap-2">
									<Button variant="ghost" size="icon" onclick={() => openEditDialog(flip)}>
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
							<Table.Cell colspan="7" class="text-center py-8 text-muted-foreground">
								No craft flips found. Add your first craft flip to get started!
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

<!-- Add/Edit Dialog -->
<Dialog.Root bind:open={showAddDialog}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>{editingFlip ? 'Edit Craft Flip' : 'Add New Craft Flip'}</Dialog.Title>
			<Dialog.Description>
				{editingFlip ? 'Update the craft flip details below.' : 'Add a new craft flip. Select output item and input ingredients from your prices table.'}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
			<!-- Output Item -->
			<div class="grid gap-2">
				<label for="outputItem" class="text-sm font-medium">Output Item (Result)</label>
				<ItemSearch
					items={prices}
					value={formData.outputItemId}
					placeholder="Search output item..."
					onchange={(itemId) => {
						formData.outputItemId = itemId;
						formData.outputItemName = itemId;
					}}
				/>
			</div>

			<!-- Output Quantity -->
			<div class="grid gap-2">
				<label for="outputQuantity" class="text-sm font-medium">Output Quantity</label>
				<Input
					id="outputQuantity"
					type="number"
					min="1"
					bind:value={formData.outputQuantity}
				/>
			</div>

			<!-- Input Items -->
			<div class="grid gap-2">
				<div class="flex items-center justify-between">
					<label class="text-sm font-medium">Input Items (Ingredients)</label>
					<Button variant="outline" size="sm" onclick={addInputItem}>
						<Plus class="h-4 w-4 mr-1" /> Add Ingredient
					</Button>
				</div>
				<div class="space-y-2">
					{#each formData.inputItems as input, index}
						<div class="flex items-center gap-2">
							<ItemSearch
								items={prices}
								value={input.itemId}
								placeholder="Search ingredient..."
								onchange={(itemId) => onInputItemSelect(index, itemId)}
							/>
							<Input
								type="number"
								min="1"
								class="w-20"
								bind:value={formData.inputItems[index].quantity}
							/>
							<Button variant="ghost" size="icon" onclick={() => removeInputItem(index)}>
								<X class="h-4 w-4" />
							</Button>
						</div>
					{/each}
					{#if formData.inputItems.length === 0}
						<p class="text-sm text-muted-foreground">No ingredients added. Click "Add Ingredient" to add input items.</p>
					{/if}
				</div>
			</div>

			<!-- Notes -->
			<div class="grid gap-2">
				<label for="notes" class="text-sm font-medium">Notes (optional)</label>
				<Input
					id="notes"
					placeholder="Any additional notes..."
					bind:value={formData.notes}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={saveFlip}>
				{editingFlip ? 'Save Changes' : 'Add Craft Flip'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
