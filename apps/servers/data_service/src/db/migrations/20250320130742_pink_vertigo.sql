CREATE TABLE IF NOT EXISTS "batch_job_dependencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" uuid NOT NULL,
	"depends_on_job_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch_job_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" uuid NOT NULL,
	"image_path" text NOT NULL,
	"perspective" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"processing_time" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch_jobs" (
	"job_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"config" jsonb NOT NULL,
	"total_images" integer NOT NULL,
	"processed_images" integer DEFAULT 0 NOT NULL,
	"failed_images" integer DEFAULT 0 NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_job_dependencies" ADD CONSTRAINT "batch_job_dependencies_job_id_batch_jobs_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."batch_jobs"("job_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_job_dependencies" ADD CONSTRAINT "batch_job_dependencies_depends_on_job_id_batch_jobs_job_id_fk" FOREIGN KEY ("depends_on_job_id") REFERENCES "public"."batch_jobs"("job_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_job_items" ADD CONSTRAINT "batch_job_items_job_id_batch_jobs_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."batch_jobs"("job_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
