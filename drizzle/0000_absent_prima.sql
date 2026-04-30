CREATE TABLE "flips" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" varchar(256) NOT NULL,
	"item_name" varchar(256),
	"buy_price" double precision NOT NULL,
	"sell_price" double precision NOT NULL,
	"quantity" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prices" (
	"item_id" varchar(256) PRIMARY KEY NOT NULL,
	"buy_price" double precision,
	"sell_price" double precision,
	"updated_at" timestamp DEFAULT now()
);
