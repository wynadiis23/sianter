ALTER TABLE "antrean" ADD COLUMN "petugas_id" varchar;--> statement-breakpoint
ALTER TABLE "antrean_log" ADD COLUMN "petugas_id" varchar;--> statement-breakpoint
ALTER TABLE "antrean" ADD CONSTRAINT "antrean_petugas_id_user_id_fk" FOREIGN KEY ("petugas_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;