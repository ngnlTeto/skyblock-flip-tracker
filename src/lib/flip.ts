import { CircleSlash2, Gavel, Hammer, ShoppingCart, Sparkles } from 'lucide-svelte';

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

// Get category icon and color
export function getCategoryInfo(category: FlipCategory) {
	switch (category) {
		case FlipCategory.AUCTION_FLIP:
			return { icon: Gavel, color: 'text-purple-500' };
		case FlipCategory.FORGE_FLIP:
			return { icon: Hammer, color: 'text-orange-500' };
		case FlipCategory.BAZAAR_FLIP:
			return { icon: ShoppingCart, color: 'text-blue-500' };
		case FlipCategory.CRAFT_FLIP:
			return { icon: Sparkles, color: 'text-emerald-500' };
		default:
			return { icon: CircleSlash2, color: 'text-muted-foreground' };
	}
}
