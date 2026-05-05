export type Prices = { buyPrice: number; sellPrice: number };

//#region Bazaar
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

interface BazaarProduct {
	product_id: string;
	sell_summary: OrderSummary[];
	buy_summary: OrderSummary[];
	quick_status: QuickStatus;
}

export interface BazaarResponse {
	success: boolean;
	lastUpdated: number;
	products: {
		[productId: string]: BazaarProduct;
	};
}
//#endregion

//#region Auctions
/**
 * Represents a single bid placed on an auction.
 */
interface Bid {
	/** The UUID of the auction this bid belongs to */
	auction_id: string;

	/** The UUID of the player who placed the bid */
	bidder: string;

	/** The profile ID of the bidder */
	profile_id: string;

	/** The amount of coins bid */
	amount: number;

	/** Unix timestamp (ms) of when the bid was placed */
	timestamp: number;
}

/**
 * Represents a single auction listing on the Hypixel Skyblock Auction House.
 */
interface Auction {
	/** Unique identifier for the auction */
	uuid: string;

	/** UUID of the player who created the auction */
	auctioneer: string;

	/** Profile ID of the auctioneer */
	profile_id: string;

	/** List of co-op member UUIDs associated with the auction */
	coop: string[];

	/** Unix timestamp (ms) of when the auction started */
	start: number;

	/** Unix timestamp (ms) of when the auction ends */
	end: number;

	/** Display name of the item being auctioned */
	item_name: string;

	/** Full lore/description of the item (may contain color codes) */
	item_lore: string;

	/** Extra searchable metadata about the item */
	extra: string;

	/** List of category tags associated with the item */
	categories: string[];

	/** Primary category of the item (e.g. "weapon", "armor") */
	category: string;

	/** Rarity tier of the item (e.g. "COMMON", "RARE", "LEGENDARY") */
	tier: string;

	/** The minimum starting bid in coins */
	starting_bid: number;

	/** Base64-encoded NBT item data */
	item_bytes: string;

	/** Whether the auction has been claimed by the seller */
	claimed: boolean;

	/** List of UUIDs of players who have claimed bids */
	claimed_bidders: string[];

	/** The current highest bid amount in coins */
	highest_bid_amount: number;

	/** Unix timestamp (ms) of when the auction data was last updated */
	last_updated: number;

	/** Whether this is a Buy It Now (BIN) auction */
	bin: boolean;

	/** List of bids placed on this auction */
	bids: Bid[];

	/**
	 * Optional unique identifier for the specific item instance.
	 * Only present on some auctions (BIN listings).
	 */
	item_uuid?: string;
}

/**
 * Top-level response from the Hypixel Skyblock Auctions API.
 */
export interface AuctionsResponse {
	/** Whether the API request was successful */
	success: boolean;

	/** The current page number (zero-indexed) */
	page: number;

	/** Total number of pages available */
	totalPages: number;

	/** Total number of active auctions across all pages */
	totalAuctions: number;

	/** Unix timestamp (ms) of when the auction data was last updated */
	lastUpdated: number;

	/** List of auctions on the current page */
	auctions: Auction[];
}
//#endregion
