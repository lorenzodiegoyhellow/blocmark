-- Create the users table (this is what's missing and causing registration to fail)
CREATE TABLE IF NOT EXISTS "users" (
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

-- Create other essential tables
CREATE TABLE IF NOT EXISTS "locations" (
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

CREATE TABLE IF NOT EXISTS "bookings" (
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

CREATE TABLE IF NOT EXISTS "messages" (
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

-- Test the users table
SELECT COUNT(*) as user_count FROM users;
