CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"title" varchar NOT NULL,
	"summary" text,
	"experience" text,
	"education" text,
	"skills" text,
	"contact" text,
	"file_url" varchar,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "thumbnail" varchar;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "candidate_id";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "content";