ALTER TABLE "flips" ADD COLUMN "output_item_id" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "flips" ADD COLUMN "output_item_name" varchar(256);--> statement-breakpoint
ALTER TABLE "flips" ADD COLUMN "input_items" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "flips" ADD COLUMN "output_quantity" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "flips" DROP COLUMN "item_id";--> statement-breakpoint
ALTER TABLE "flips" DROP COLUMN "item_name";--> statement-breakpoint
ALTER TABLE "flips" DROP COLUMN "buy_price";--> statement-breakpoint
ALTER TABLE "flips" DROP COLUMN "sell_price";--> statement-breakpoint
ALTER TABLE "flips" DROP COLUMN "quantity";