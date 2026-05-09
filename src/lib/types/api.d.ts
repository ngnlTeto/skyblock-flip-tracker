export type Prices = { buyPrice: number; sellPrice: number };

//#region Bazaar
export interface BazaarResponse {
	success: boolean;
	lastUpdated: number;
	products: {
		[productId: string]: BazaarProduct;
	};
}

interface BazaarProduct {
	product_id: string;
	sell_summary: OrderSummary[];
	buy_summary: OrderSummary[];
	quick_status: QuickStatus;
}

interface OrderSummary {
	amount: number;
	pricePerUnit: number;
	orders: number;
}

interface QuickStatus {
	productId: string;
	sellPrice: number;
	sellVolume: number;
	sellMovingWeek: number;
	sellOrders: number;
	buyPrice: number;
	buyVolume: number;
	buyMovingWeek: number;
	buyOrders: number;
}
//#endregion

//#region Auctions
export interface AuctionsResponse {
	success: boolean;
	page: number;
	totalPages: number;
	totalAuctions: number;
	lastUpdated: number;
	auctions: Auction[];
}

interface Auction {
	uuid: string;
	auctioneer: string;
	profile_id: string;
	coop: string[];
	start: number;
	end: number;
	item_name: string;
	item_lore: string;
	extra: string;
	categories: string[];
	category: string;
	tier: string;
	starting_bid: number;
	item_bytes: string;
	claimed: boolean;
	claimed_bidders: string[];
	highest_bid_amount: number;
	last_updated: number;
	bin: boolean;
	bids: unknown; // complex and I don't want to use it anyways
	item_uuid?: string;
}

//#endregion

//#region Items
interface ItemsResponse {
	success: boolean;
	lastUpdated: number;
	items: SkyblockItem[];
}

interface SkyblockItem {
	id: string;
	name: string;
	material: string;
	durability?: number;
	skin?: ItemSkin;
	category?: string;
	tier?: string;
	npc_sell_price?: number;
	color?: string;
	glowing?: boolean;
	stats?: Record<string, number>;
	requirements?: Requirement[];
	essence?: EssenceCost;
	[key: unknown]: unknown;
}
//#endregion
