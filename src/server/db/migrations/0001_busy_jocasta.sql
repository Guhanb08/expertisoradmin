CREATE TYPE "public"."video_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"author" text,
	"go_live_at" timestamp with time zone DEFAULT now(),
	"is_active" boolean DEFAULT true NOT NULL,
	"notify_on_go_live" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"label" text,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"youtube_url" text NOT NULL,
	"title" text,
	"published_at" timestamp with time zone,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"notify_on_publish" boolean DEFAULT true NOT NULL,
	"status" "video_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
