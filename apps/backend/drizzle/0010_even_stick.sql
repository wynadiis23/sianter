ALTER TABLE "sesi" ADD COLUMN "layanan_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "sesi" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sesi" ADD CONSTRAINT "sesi_layanan_id_layanan_id_fk" FOREIGN KEY ("layanan_id") REFERENCES "public"."layanan"("id") ON DELETE cascade ON UPDATE no action;