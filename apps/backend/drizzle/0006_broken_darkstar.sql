CREATE TABLE "pemohon" (
	"id" varchar PRIMARY KEY NOT NULL,
	"nik" varchar(16) NOT NULL,
	"nama" varchar(100) NOT NULL,
	"no_hp" varchar(15),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pemohon_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
ALTER TABLE "antrean" ADD COLUMN "pemohon_id" varchar;--> statement-breakpoint
ALTER TABLE "antrean_log" ADD COLUMN "pemohon_id" varchar;--> statement-breakpoint
ALTER TABLE "antrean" ADD CONSTRAINT "antrean_pemohon_id_pemohon_id_fk" FOREIGN KEY ("pemohon_id") REFERENCES "public"."pemohon"("id") ON DELETE set null ON UPDATE no action;