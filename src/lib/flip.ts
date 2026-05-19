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
export function getCategoryInfo(category: FlipCategory | undefined) {
	switch (category) {
		case FlipCategory.AUCTION_FLIP:
			return { icon: Gavel, color: '#a855f7' };
		case FlipCategory.FORGE_FLIP:
			return { icon: Hammer, color: '#f97316' };
		case FlipCategory.BAZAAR_FLIP:
			return { icon: ShoppingCart, color: '#3b82f6' };
		case FlipCategory.CRAFT_FLIP:
			return { icon: Sparkles, color: '#10b981' };
		default:
			return { icon: CircleSlash2, color: '#a1a1a1' };
	}
}
