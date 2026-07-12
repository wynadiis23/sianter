CREATE TABLE "sesi_layanan" (
	"id" varchar PRIMARY KEY NOT NULL,
	"sesi_id" varchar NOT NULL,
	"layanan_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sesi_layanan_sesi_id_layanan_id_unique" UNIQUE("sesi_id","layanan_id")
);
--> statement-breakpoint
ALTER TABLE "sesi" DROP CONSTRAINT "sesi_layanan_id_layanan_id_fk";
--> statement-breakpoint
ALTER TABLE "sesi_layanan" ADD CONSTRAINT "sesi_layanan_sesi_id_sesi_id_fk" FOREIGN KEY ("sesi_id") REFERENCES "public"."sesi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi_layanan" ADD CONSTRAINT "sesi_layanan_layanan_id_layanan_id_fk" FOREIGN KEY ("layanan_id") REFERENCES "public"."layanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi" DROP COLUMN "layanan_id";