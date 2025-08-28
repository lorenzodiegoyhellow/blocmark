CREATE TABLE "addons" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"price_unit" text DEFAULT 'hour' NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_addons" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"addon_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_price" integer NOT NULL,
	"status" text NOT NULL,
	"activity_type" text,
	"project_name" text,
	"renter_company" text,
	"project_description" text
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"address" text NOT NULL,
	"amenities" text[] NOT NULL,
	"availability" jsonb NOT NULL,
	"property_type" text NOT NULL,
	"category" text DEFAULT 'photo-studio' NOT NULL,
	"size" integer NOT NULL,
	"max_capacity" integer NOT NULL,
	"incremental_rate" integer NOT NULL,
	"cancellation_policy" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"instant_booking" boolean DEFAULT false NOT NULL,
	"min_hours" integer DEFAULT 1 NOT NULL,
	"image_tags" jsonb[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"location_id" integer NOT NULL,
	"booking_id" integer,
	"read" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"roles" text[] DEFAULT '{"owner","client"}' NOT NULL,
	"profile_image" text,
	"bio" text,
	"location" text,
	"phone_number" text,
	"terms_accepted" boolean DEFAULT false,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
