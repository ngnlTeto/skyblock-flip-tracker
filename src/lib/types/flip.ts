export interface Flip {
	id: string;
	outputItem: ItemComponent;
	inputItems: ItemComponent[];
	// meta information
	category: FlipCategory | undefined;
	isActive: boolean;
	notes: string;
}

export interface ItemComponent {
	itemId: string | undefined;
	quantity: number;
}

export enum FlipCategory {
	CRAFT_FLIP = 'CRAFT_FLIP',
	AUCTION_FLIP = 'AUCTION_FLIP',
	BAZAAR_FLIP = 'BAZAAR_FLIP',
	FORGE_FLIP = 'FORGE_FLIP'
}
