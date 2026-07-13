CREATE TABLE "sesi" (
	"id" varchar PRIMARY KEY NOT NULL,
	"nama" varchar(100) NOT NULL,
	"jam_mulai" time NOT NULL,
	"jam_selesai" time NOT NULL,
	"kuota" integer DEFAULT 0 NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "antrean" ALTER COLUMN "kode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "antrean" ALTER COLUMN "nomor_urut" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "antrean_log" ALTER COLUMN "kode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "antrean_log" ALTER COLUMN "nomor_urut" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "antrean" ADD COLUMN "sesi_id" varchar;--> statement-breakpoint
ALTER TABLE "antrean" ADD COLUMN "tanggal_kunjungan" date;--> statement-breakpoint
ALTER TABLE "antrean" ADD COLUMN "checked_in_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "antrean" ADD COLUMN "expired_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "antrean_log" ADD COLUMN "sesi_id" varchar;--> statement-breakpoint
ALTER TABLE "antrean_log" ADD COLUMN "tanggal_kunjungan" date;--> statement-breakpoint
ALTER TABLE "antrean_log" ADD COLUMN "checked_in_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "antrean_log" ADD COLUMN "expired_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "antrean" ADD CONSTRAINT "antrean_sesi_id_sesi_id_fk" FOREIGN KEY ("sesi_id") REFERENCES "public"."sesi"("id") ON DELETE set null ON UPDATE no action;